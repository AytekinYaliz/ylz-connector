const { Job, Group } = require("brigadier")
const devops = require("devops-brigade");

// TODO: The notifyInfoAsync method requires a Microsoft Teams webhook - see
// https://confluence-engineering.dentsuaegis.com/display/GD/Send+notifications+to+Teams+channel
// or comment them out until ready


class JobFactory {
  createBuildJob(e, project) {
    // TODO: If not "node", specify alternative docker container for your build
    var build = new Job("build", "node") 
    build.storage.enabled = true

    let taskFactory = new devops.BuildTaskFactory(e, project)
    build.tasks = [
      "cd /src",

      taskFactory.gitVersion(),

      // TODO: Remove npmVersion if NOT a node project
      taskFactory.npmVersion(),

      // Build
      "git config --global credential.helper 'store --file ~/.git-credentials'",
      `echo https://${project.secrets.giteauser}:${project.secrets.giteapass}@gitea-tooling.az.devops.gdpdentsu.net > ~/.git-credentials`,
      // "rm -rf node_modules",
      "npm install",
      // install babel deps
      //"npm install --save-dev @babel/core @babel/cli",
      "npm run build",
      

      taskFactory.storeBuild()
    ]


    return build;
  }

  createDeployJob(teamEnv, e, project) {
    let deployTaskFactory = new devops.DeployTaskFactory(teamEnv, e, project)
    let deployJob = new Job(`deploy-${teamEnv}`, `globaldevopsreg11.azurecr.io/builder:latest`)
    deployJob.storage.enabled = true

    // TODO: customise values based on your helm chart
    let values = {
      node_env: `${project.secrets[teamEnv+'_node_env']}`,
      port: 8000,
      image: {
        tag: "${APP_VER}",
        repository: `${project.secrets.app_container_reg}/${devops.Utilities.getAppName()}`
      },
      ingress: {
        enabled: true,
        hosts: [`${teamEnv}-${project.secrets.app_name}.az.${project.secrets[teamEnv + "-target_name"]}.gdpdentsu.net`],
        class: 'nginx'
      }
    };

    deployJob.tasks = [
      "cd /src",
      deployTaskFactory.loginToCluster(),
      deployTaskFactory.setAppVerEnv(),
      deployTaskFactory.helmUpgradeInstallCommandWithValidation(
        `${teamEnv}`,
        `${teamEnv}-${project.secrets.app_name}`,
        `./helm/${project.secrets.app_name}`,
        values)
    ]

    return deployJob;
  }
}

devops.Events.onPushDevelop(async (e, project) => {
  let jobFactory = new JobFactory();

  await jobFactory.createBuildJob(e, project).run();
  // TODO: add SonarQube integration https://confluence-engineering.dentsuaegis.com/display/GD/Sonarqube
  await devops.Standard.packageAsync();
  // TODO: customise the polling URL to match your endpoint, 
  // remember svc.cluster.local addresses only allowed for envs on same cluster as CI
  // await devops.Standard.pollHealthAsync(`https://[yourteamenv]-[appname].az.[yourbase].gdpdentsu.net/api/health`);
  // TODO: add component tests against the dev environment here
  await devops.Standard.approveAsync();
  //await jobFactory.createDeployJob(`${project.secrets.team_name}-poc`, e, project).run();
  // TODO: deploy to further environments such as "int" and run integration tests
  // TODO: upload integration test results

  // TODO: the following sends a notification via teams - remove if not using teams
  // var semver = await devops.Utilities.getSemVerAsync();
  // await devops.Utilities.notifyInfoAsync(`Deployment to test complete`, `Deployed version ${semver}`);
});

// devops.Events.onPushOther(async (e, project) => {
//   new JobFactory().createBuildJob(e, project).run();
// });

devops.Events.onDeploy(async (e, project, teamEnv, version) => {
  await new JobFactory().createDeployJob(teamEnv, e, project).run();
  // await devops.Utilities.notifyInfoAsync(`Deployment`, `Deployment to ${teamEnv} of ${version} initiated`);
});

exports.JobFactory = JobFactory