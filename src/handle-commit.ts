import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import { ubiquityOsDeployer } from "./deploys-bot";
import { getAuth } from "./get-credentials";

// eslint-disable-next-line @typescript-eslint/naming-convention
export async function handleCommit(owner: string, repo: string, commit_sha: string, deploymentLink: string) {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: await getAuth(),
  });

  const slicedSha = commit_sha.slice(0, 7);
  const body = `<div align="right"><a href="${deploymentLink}"><code>${slicedSha}</code></a></div>`;

  // Get all comments
  octokit.repos
    .listCommentsForCommit({
      owner,
      repo,
      commit_sha,
    })
    .then(({ data }) => {
      const botComment = data.find((comment) => comment.user?.id === ubiquityOsDeployer.id);
      if (botComment) {
        // If bot comment exists, update it
        if (!botComment.body.includes(body)) {
          return octokit.repos.updateCommitComment({
            owner,
            repo,
            comment_id: botComment.id,
            body: botComment.body + "\n" + body,
          });
        }
      } else {
        // If bot comment does not exist, create a new one
        return octokit.repos.createCommitComment({
          owner,
          repo,
          commit_sha,
          body,
        });
      }
    })
    .catch(console.error);
}
