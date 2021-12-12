let tabContent = [
    {
        name: "home",
        content: `Hi, I'm Vivek Shrikhande
        <br/><span style='color: #238636;'># Skills</span>
        <br/><span style='color: #238636;'>// Skills</span>`},
    {
        name: "projects",
        content: `
        <p>
            I do open source development during my free time. I have created a couple of
            open projects as listed below,
        </p>

        <dl class="last-elem">
            <dt><a href="https://github.com/vivek-shrikhande/json-flat"><h3>- json-flat</h3></a></dt>
            <dd>A Python library to flatten a nested json. Nested json is common in documents stores like
            MongoDB, elasticsearch etc. Since, it's nested , it can't be directly shown in a tabular format
            (for example in UI) or exported to a CSV. json-flat can help convert such json into a
            flatter one.</dd>

            <dt><a href="https://vivek-shrikhande.github.io/easy-mql/#/"><h3>- easy-mql</h3></a></dt>
            <dd>
                <p class="last-elem">
                    An easy-to-use SQL like query language for MongoDB. It solves few difficulties in writing
                    bson based MongoDB queries (the official MQL). For instance, it eliminates the use of { and }
                    around all the constructs, allows the use of symbolic operators like + for addition, - for
                    subtraction etc. It also ports few MongoDB syntaxes to those of SQL like CASE, EXTRACT, IF,
                    IF_NULL etc.
                </p>
            </dd>
        </dl>
        `
    },
    {
        name: "experience", 
        content: "some experience content"
    },
    {
        name: "about",
        content: `
        <p>
            I'm an experienced software developer. I'm mainly focused on backend systems
            but know the basics of few popular UI frameworks/libraries like Angular, React, Svelte.
            For instance, I designed and developed this site with Svelte from scratch.
        </p>

        <p>
            Besides coding, I play PUBG (multiplayer mobile game), watch Cricket, create memes.
        </p>


        <h3># Contact Info</h3>
        <p class="last-elem">
            Vivek Shrikhande<br/>
            - Bengaluru, INDIA - 590029<br/>
            - email: <span class="wrapword">vivekshrikhande444@gmail.com</span>
        </p>
        `
    },
];

export default tabContent;
