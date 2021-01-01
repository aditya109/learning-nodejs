const http = require('http');
const port = parseInt(process.argv[2] || 3000);

const options = [
        "recent hay using lake determine cry audience sell since ice accept human judge stuck cost bite beauty lost church recently quick tried completely spendRandom",
        "range making simple just difference advice clothes cause cookies pack halfway expression anything large aloud till man foot magic done fierce army giving regular",
        "easily upper seeing trade join space tide mountain clearly walk paragraph sure he building time brought foreign bring relationship train give basket uncle rope",
        "floor away task construction tent grade driver red alphabet lunch sang minute result planet large month bent figure ever here steady must very structure",
        "vertical sang imagine cent behind provide refer hole whenever solution person horn send straw among drop indicate fairly organization these control split clear saved",
        "avoid apart upper habit many tea double curve whistle allow heat hurry event practice problem warm nothing suppose goes serious fog bark prize production"
]

const server = http.createServer((req, res) => {
        const randomIndex = Math.floor(Math.random() * options.length)
        const payload = JSON.stringify({
                port,
                processID: process.pid,
                advise: options[randomIndex]
        })
        res.writeHead(200, {
                'Content-Type': 'application/json'
        });
        res.end(payload);
})

server.listen(port);
console.log(`advise service running on port ${port}`);
