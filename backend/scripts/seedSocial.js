const { fetchGitHubMock } = require('../src/workers/githubFetcher');
const { fetchRedditMock } = require('../src/workers/redditFetcher');

(async () => {
  await fetchGitHubMock();
  await fetchRedditMock();
  console.log("Inserted mock GitHub issue and Reddit post ✅");
  process.exit(0);
})();
