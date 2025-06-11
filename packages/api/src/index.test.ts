import { api, entity, key, string, TypeFromMetadata } from "./Metadata";
import { id } from "./Metadata/Id";
import { odataConnector } from "./Connectors/OData";
import { describe, expect, test } from "vitest";
import { guid } from "./Metadata/Guid";

const accountMetadata = entity("Account", {
    id: id("AccountId"),
    name: key("Name"),
    accountNumber: string("AccountNumber", { maxLength: 20 }),
});

type AccountMetadata = typeof accountMetadata;
type Account = TypeFromMetadata<AccountMetadata>;
type AccountId = Account["id"];

const teamRoleMetadata = entity("TeamRoles", {
    id: id("TeamRoleId"),
    teamId: guid("TeamId", "Team"),
    roleId: guid("RoleId", "Role"),
});

type TeamRoleMetadata  = typeof teamRoleMetadata;
type TeamRole = TypeFromMetadata<TeamRoleMetadata>;
type TeamId = TeamRole["teamId"];


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
            teamRoles: teamRoleMetadata,
        }
    })


    test("fetch linking entity with guids", async () => {

        const teamRole = await connector.getSetName("TeamRoles");
        expect(teamRole).toBe("teamrolescollection");

        // guid match should work
        const result = await testApi.teamRoles.retrieveMultiple({
            match: {
                teamId: "4823bacd-4d2d-ef11-840a-000d3a470017" as TeamId
            }
        });

        expect(result.length).toBeGreaterThan(0);
    });


    const accountId = "f9783d6f-c4f5-eb11-94ef-000d3a2bfe19" as AccountId;
    const account = await testApi.accounts.retrieve(accountId);

    console.log(account);

    await testApi.accounts.retrieveMultiple()
});
