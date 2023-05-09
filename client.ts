import {
    createConnection,
    createLongLivedTokenAuth,
} from "npm:home-assistant-js-websocket@8.0.1"
import {config} from "https://deno.land/x/dotenv/mod.ts";

const TOKEN = config().HASS_TOKEN;

const auth = createLongLivedTokenAuth(
    "https://hass.coopermoses.com",
    TOKEN,
);

async function conn() {
    return await createConnection({ auth} );
}

async function doGetLovelace(): Promise<void> {
    const connection = await conn();
    const lovelace = await connection.sendMessagePromise({
        type: "lovelace/config",
        url_path: null,
        force: false,
    });

    Deno.stdout.write(new TextEncoder().encode(JSON.stringify(lovelace)))
}


async function doGetEnergy(): Promise<void> {
    const connection = await conn();
    const lovelace = await connection.sendMessagePromise({
        type: "energy/config",
        url_path: null,
        force: false,
    });

    Deno.stdout.write(new TextEncoder().encode(JSON.stringify(lovelace)))
}

async function doSetLovelace() {
    const val = new TextDecoder().decode(await Deno.readAll(Deno.stdin));
    const dash = JSON.parse(val)

    const connection = await conn();
    const ret = await connection.sendMessagePromise<{success: boolean}>({
        type: "lovelace/config/save",
        url_path: null,
        config: dash,
    })

    if (!ret.success) {
        console.error("Error: ${ret}");
    } else {
        console.log("Saved!");
    }
}



(async () => {

    if (!TOKEN) {
        console.error("Set HASS_TOKEN in your environment or .env file");
        Deno.exit(1);
    }

    const cmd = Deno.args[0]
    switch (cmd) {
        case "get":
            await doGetLovelace();
            Deno.exit(0);
            break;
        case "set":
            await doSetLovelace();
            Deno.exit(0);
            break;
        default:
            console.error(`Unexpected command: ${cmd}`)
            Deno.exit(1);
    }

})();
