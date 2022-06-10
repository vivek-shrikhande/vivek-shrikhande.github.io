let tabContent = [
    {
        name: "about",
        content: `
        <p>
        Hi,
        </p> 
        
        <p>
        My name is Vivek Shrikhande. I am an experienced Software Engineer based
        in Bengaluru, India. I am mainly focused on backend development but also
        have working experience in building UI.
        </p>
        
        <p>
        During my last role at Maplelabs, I led a small team of 3 for developing
        a microservices based application.
        </p>

        <p>
        I do open source development in my free time. I have authored few open
        source projects (see projects section) and recently have
        also contributed to
        <a href="https://github.com/vivek-shrikhande/tern/commit/95ae93cdc9416fed15ca0b102df3709f99041383">
        tern</a>
        SQL migrator written in Go.
        </p>

        Some of the technologies I am familiar with,</br>
        <h4>&nbsp; # Languages</h4>
        &nbsp; - Go, Python</br>
        &nbsp; - Java, Javascript (prior experience)

        <h4>&nbsp; # Frontend (working experience)</h4>
        &nbsp; - HTML, CSS, Angular, Svelte 

        <h4>&nbsp; # Platforms and tools</h4>
        &nbsp; - Linux, Docker, Kubernetes</br>
        &nbsp; - Git, Makefile</br>

        <h4>&nbsp; # Databases, Message queue and others</h4>
        &nbsp; - ELK Stack, Kafka, Redis, MongoDB, PostgreSQL, BigQuery, Snowflake</br>
        </br>
        
        <p>
        Besides programming, I play PUBG (online multiplayer game), watch Cricket and few other sports.
        </p>

        <p>
        Currently I am on vacation and open to opportunities.
        </p>

        <p>
        If you are interested in having me in your project, please contact me by email.
        </p>        
        `
    },
    {
        name: "projects",
        content: `
        <p>
            I do open source development in my free time. I have authored a few open
            source projects as listed below,
        </p>

        <dl class="last-elem">
            
            <dt><a href="https://github.com/vivek-shrikhande/json-flat"><h3>- json-flat</h3></a></dt>
            <dd>A Python library to flatten a nested json. Nested json is common in documents stores like
            MongoDB, elasticsearch etc. Since it's nested, it can't be directly shown in a tabular format
            (for example in UI) or exported to a CSV. json-flat can help convert such json into a
            flatter one. Try it out <a href="https://vivek-shrikhande.github.io/json-to-csv-web-app">online</a>.
            </dd>

            <dt><a href="https://vivek-shrikhande.github.io/json-to-csv-web-app"><h3>- json-to-csv-web-app</h3></a></dt>
            <dd>A simple website for flattening/converting json to csv. Uses the above library for the actual flattening.
            The backend API is served using AWS lambda.</dd>

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
];

export default tabContent;
