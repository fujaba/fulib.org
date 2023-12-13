import {Octokit} from 'octokit';

const milestone = +process.argv[2];

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
});

// get issues for milestone
async function getIssues(milestone) {
    return octokit.paginate(
        'GET /repos/{owner}/{repo}/issues',
        {
            owner: 'fujaba',
            repo: 'fulib.org',
            state: 'closed',
            milestone,
        },
    );
}


function generateReleaseBody(issues) {
    // Each issue is a pull request with a body like this:
    // ```
    // ## New Changes
    // + ...
    // ## Improvements
    // * ...
    // ## Bugfixes
    // * ...
    // ```

    // Group by these sections and append the issue number at the end of each bullet point.
    const sections = {
        'General': [],
        'New Features': [],
        'Improvements': [],
        'Bugfixes': [],
        'Removals': [],
    };
    for (const issue of issues) {
        const body = issue.body;
        const lines = body.split('\r\n');
        let section = null;
        for (const line of lines) {
            if (line.startsWith('##')) {
                section = line.substr(3);
                if (!sections[section]) {
                    sections[section] = [];
                }
            } else if (section && (line.startsWith('+') || line.startsWith('*') || line.startsWith('-'))) {
                sections[section].push(line + ' #' + issue.number);
            }
        }
    }

    // Append the sections to the release body.
    return Object.entries(sections)
        .filter(section => section[1].length > 0)
        .map(section => `## ${section[0]}\n\n${section[1].join('\n')}`)
        .join('\n\n');
}

const issues = await getIssues(milestone);
console.log(generateReleaseBody(issues));
