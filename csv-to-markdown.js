const fs = require('fs');
const path = require('path');
const axios = require('axios');
const parse = require('csv-parse').parse;

// const clipboardy = require('clipboardy')

const outputFile = path.join(__dirname, 'output.md');

function writeOutputFile(content) {
  fs.writeFile(outputFile, content, (err) => {
    if (err) {
      console.error('Error writing output file:', err);
      return;
    }
    console.log('Output file saved as output.md');
  });
}

async function copyToClipboard(data) {
  try {
    const clipboardy = await (await import('clipboardy')).default;
    clipboardy.writeSync(data);
    console.log('Content copied to clipboard');
  } catch (error) {
    console.error('Error loading clipboardy:', error);
  }
}

function entryTemplate(role, circle, thisYearContact, description, playbookLink) {
  const title = `# ${role}`;

  const metadataTable = `
| Circle       | 👇 Contact to apply 👇 |
| ------------ | --------------- |
| ${circle}    | ${thisYearContact || '@samzmann'} |
`;

  const formattedDescription = description
    .replace("Main responsibilities:", "### Main responsibilities")
    .replace("Requirements:", "### Requirements")

  const learnMore = playbookLink
    ? `## Learn more\n${playbookLink}\n`
    : "";

  const separator = `
  
  ------
  
  `;

  return `
${title}
${metadataTable}
${formattedDescription}
${learnMore}
${separator}
`;
}

const getPageIntroMardown = () => {
  return `
# Open Lead/Realizer roles for Kiez Burn 2023!
This is a list of important roles that need to be filled to make Kiez Burn happen.
It’s publicly available at 👉[ wiki.kiezburn.org/s/kb23-jobs](https://wiki.kiezburn.org/s/kb23-jobs) 👈 Please share!

### 🥳 If you find an interesting role…
→ Apply for the role by reaching out to the contact person listed in the job post.
### 😪 Otherwise…
→ That’s fine. You could still support KB23 by sharing the link to this page to people around you. Just copy paste this message and send away:
> Hey! Kiez Burn 2023 is starting to take form. They still got some open roles in the orga team.
> Take a look at wiki.kiezburn.org/s/kb23-jobs and find a way to contribute! ✌️

### For Leads
If you wanna post an open role to this page, read the documentation [here](https://wiki.kiezburn.org/doc/start-here-Fape6wAzmN).

------------

`
} 
  

// Format the data as Markdown
function formatMarkdown(entries) {
    let markdown = getPageIntroMardown();
    entries.forEach((entry) => {
      const { Role, Circle, 'This year contact': thisYearContacts, Description, 'Playbook link': playbookLink, Status } = entry;
      
      if (Status !== "Open") {
        return
      }

      const formattedEntry = entryTemplate(Role, Circle, thisYearContacts, Description, playbookLink);
      markdown += formattedEntry;
    });
    return markdown;
  }
  


const csvUrl = 'https://docs.google.com/spreadsheets/d/1D3V15hz2pW_Or9iCVGGAhC62PuxRG4IyQGT9yqjG4gU/export?format=csv&gid=0';

// Function to fetch and parse CSV data
async function fetchAndParseCSV() {
  try {
    const response = await axios.get(csvUrl);
    const csvData = response.data;

    parse(csvData, { columns: true}, (err, records) => {
      if (err) {
        console.error('Error parsing CSV data:', err);
        return;
      }

      // Call formatMarkdown function here
      markdown = formatMarkdown(records);
      writeOutputFile(markdown)
      copyToClipboard(markdown);
    });
  } catch (error) {
    console.error('Error fetching CSV data:', error);
  }
}

// Call fetchAndParseCSV to fetch and parse the CSV data
fetchAndParseCSV();
