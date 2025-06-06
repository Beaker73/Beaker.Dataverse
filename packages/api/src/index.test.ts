import { api, entity, key, string, TypeFromMetadata } from "./Metadata";
import { id } from "./Metadata/Id";
import { odataConnector } from "./Connectors/OData";
import { describe, expect, test } from "vitest";

const accountMetadata = entity("Account", {
    id: id("AccountId"),
    name: key("Name"),
    accountNumber: string("AccountNumber", { maxLength: 20 }),
});

type AccountMetadata = typeof accountMetadata;
type Account = TypeFromMetadata<AccountMetadata>;
type AccountId = Account["id"];

describe("Live Integration Tests", async () => {


    // fetch a token from local token provider for testing
    const domain = "wur-dev";
    const response = await fetch(`http://localhost:8123/${domain}`, { method: "GET" });
    expect(response.ok).toBe(true);

    const result = await response.json() as { token: string };

    const connector = await odataConnector(new URL("https://wur-dev.crm4.dynamics.com"), {
        token: result.token,
    });

    test("set name conversion", async () => {
        const result = await connector.getSetName("Account");
        expect(result).toBe("accounts");
    });

    test("nav property name", async () => {
        const result = await connector.getNavPropName("Contact", "ParentCustomerId", "Account");
        expect(result).toBe("parentcustomerid_account");
    });

    const testApi = api({
        connector,
        sets: {
            accounts: accountMetadata,
        }
    })

    const accountId = "f9783d6f-c4f5-eb11-94ef-000d3a2bfe19" as AccountId;
    const account = await testApi.accounts.retrieve(accountId);

    console.log(account);

    await testApi.accounts.retrieveMultiple()
});
