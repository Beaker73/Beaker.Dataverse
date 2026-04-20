import { api, entity, entityMutationFields, key, string, TypeFromMetadata } from "./Metadata";
import { id } from "./Metadata/Id";
import { odataConnector } from "./Connectors/OData";
import { describe, expect, test } from "vitest";
import { guid } from "./Metadata/Guid";
import { Tag } from "./Helpers";
import { Operator } from "./Queries";
import { date } from "./Metadata/Date";
import { extend } from "./Metadata/Functions";

type ReversedString = Tag<string, "variant", "Reversed">;

const accountMetadata = extend(
    entity("Account", {
        id: id("AccountId"),
        name: key("Name"),
        accountNumber: string("AccountNumber", {
            maxLength: 20, converter: {
                convert(value: string) {
                    return value.split("").reverse().join("") as ReversedString;
                },
                revert(value: ReversedString) {
                    return value.split("").reverse().join("");
                }
            }
        }),
        companyInfoLastChangeDate: date("wur_companyinfolastchangedate"),
        ...entityMutationFields(),
    }),
    {
        originalAccountNumber: account => account.accountNumber.split("").reverse().join(""),
        append: account => (value: string) => `${account.name} (${value})`,
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

    const testApi = api({
        connector,
        sets: {
            accounts: accountMetadata,
            teamRoles: teamRoleMetadata,
        }
    })

    test("queryWithCompareDateAndTime", async () => {
        const result = await testApi.accounts.retrieveMultiple({
            query: [
                { field: "createdOn", operator: Operator.GreaterThan, value: new Date("2021-08-05T10:08:00+02:00") },
                { field: "createdOn", operator: Operator.LessThan, value: new Date("2021-08-05T10:10:00+02:00") }
            ],
            expectSingle: true,
        });

        expect(result?.accountNumber).toBe("2991000000");
    })

    test("queryWithCompareDateOnly", async () => {
        const result = await testApi.accounts.retrieveMultiple({
            query: [
                { field: "companyInfoLastChangeDate", operator: Operator.GreaterThanOrEqual, value: new Date("2025-04-09T00:00:00+02:00") },
                { field: "companyInfoLastChangeDate", operator: Operator.LessThan, value: new Date("2025-04-10T00:00:00+02:00") }
            ],
            expectSingle: true,
        });

        expect(result?.accountNumber).toBe("9107000000");
        expect(result?.companyInfoLastChangeDate).toEqual(new Date(2025, 3, 9));
    })

    test("queryWithCompareDateOnlyUsingEquals", async () => {
        const result = await testApi.accounts.retrieveMultiple({
            query: [
                { field: "companyInfoLastChangeDate", value: new Date("2025-04-09") },
            ],
            expectSingle: true,
        });

        expect(result?.accountNumber).toBe("9107000000");
    })

    test("select specific columns only - retrieveMultiple", async () => {
        const result = await testApi.accounts.retrieveMultiple({
            select: ["id", "name"],
            match: { name: "Baron Groente en Fruit" },
            expectSingle: true,
            requireData: true,
        });

        // result.accountNumber is not accessible due to typing removing the accountNumber property. 
        // That is good during dev, but not for this test, so cast back to full Account type.
        expect((result as Account).accountNumber).toBeUndefined();
    });

    test("select specific columns only - retrieve", async () => {
        const result = await testApi.accounts.retrieve("4eb1374b-fecc-ef11-b8e8-7c1e524e81ed" as AccountId, {
            select: ["id", "name"],
        });

        // result.accountNumber is not accessible due to typing removing the accountNumber property. 
        // That is good during dev, but not for this test, so cast back to full Account type.
        expect((result as Account).accountNumber).toBeUndefined();
    });


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

    expect(account.accountNumber).toBe("2991000000");
    console.log(account);

    expect(account.originalAccountNumber).toBe("0000001992");
    expect(account.append("test")).toBe("12Banaan B.V. (test)");

    await testApi.accounts.retrieveMultiple()
});
