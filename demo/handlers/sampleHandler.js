import Human from '../types/Human';

function formatOutput ({ name, address }) {
    // return new Human(name, address);
    return {
        emailTitle: `Dear Mr/Mrs ${name}: You have won 90,000,000 Dollahs`,
        emailBody: `
            Hey there!
                It has come to our attention that your current residence (${address})
                was built on top of an ancient native burial ground. As such, we'd like
                to pay you money to get off it. Lots of money.

                Just bank in a transfer fee to XXXX-XXXX-XXXX-XXXX of YYYY bank.

            Your Friends,
                The Government
        `,
    }
}

export function handler (req, res) {
    /** @type Human */
    const body = req.body;

    const result = formatOutput(body, {});

    return res.send(result);
}