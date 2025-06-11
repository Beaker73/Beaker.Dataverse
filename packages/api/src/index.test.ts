import { entity, key, string, TypeFromMetadata } from "./Metadata";
import { id } from "./Metadata/Id";
import { odataConnector } from "./Connectors/OData";
import { withMethods } from "./Metadata/Methods";
import { newEntity } from "./EntityMapper";
import { describe, test, expect } from "vitest";
import { api } from "./Api";
import { guid } from "./Metadata/Guid";

const accountMetadata = withMethods(
    entity("Account", {
        id: id("AccountId"),
        name: key("Name"),
        accountNumber: string("AccountNumber", { maxLength: 20, readOnly: true }),
    }),
    {
        getKey: self => self.id,
        append: self => (more: string) => `${self.name}=>${more}`,
    }
);

const contactMetadata = entity("Contact", {
    id: id("ContactId"),
});

type AccountMetadata = typeof accountMetadata;
type Account = TypeFromMetadata<AccountMetadata>;
type AccountId = Account["id"];

const teamRoleMetadata = entity("TeamRoles", {
    id: id("TeamRoleId"),
    teamId: guid("TeamId", "Team"),
    roleId: guid("RoleId", "Role"),
});

type TeamRoleMetadata = typeof teamRoleMetadata;
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

    // when target is not typed, thus inferred, we get a type instantiation is excessively deep issue. Why?
    let a = newEntity(accountMetadata, {
        name: "Test Account",
        //accountNumber: "1234567890",
    });

    newEntity(contactMetadata, {});

    console.log(a.getKey());
    console.log(a.append("Test"));


    describe("Integration", async () => {

        // fetch a token from local token provider for testing
        const domain = "wur-dev";
        const response = await fetch(`http://localhost:8123/${domain}`, { method: "GET" });
        expect(response.ok).toBe(true);

        const result = await response.json() as { token: string };

        const connector = await odataConnector(new URL("https://wur-dev.crm4.dynamics.com"), {
            token: result.token,
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

        test("Retrieve Acount", async () => {
            const accountId = "f9783d6f-c4f5-eb11-94ef-000d3a2bfe19" as AccountId;
            const account = await testApi.accounts.retrieve(accountId);

            expect(account.id).toBe(accountId);
            expect(account.name).toBe("12Banaan B.V.12345");
        });

    });

});
