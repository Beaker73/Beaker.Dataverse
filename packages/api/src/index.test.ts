import { api, entity, key, string, TypeFromMetadata } from "./Metadata";
import { id } from "./Metadata/Id";
import { odataConnector } from "./Connectors/OData";

const accountMetadata = entity("Account", {
    id: id("AccountId"),
    name: key("Name"),
    accountNumber: string("AccountNumber", { maxLength: 20 }),
});

type AccountMetadata = typeof accountMetadata;
type Account = TypeFromMetadata<AccountMetadata>;
type AccountId = Account["id"];

const connector = await odataConnector(new URL("https://wur-dev.crm4.dynamics.com"), {
    token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL3d1ci1kZXYuY3JtNC5keW5hbWljcy5jb20vIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMjdkMTM3ZTUtNzYxZi00ZGMxLWFmODgtZDI2NDMwYWJiMThmLyIsImlhdCI6MTc0NzMyNzY5MywibmJmIjoxNzQ3MzI3NjkzLCJleHAiOjE3NDczMzE1OTMsImFpbyI6ImsyUmdZSGp6MW5nSm54clhDYVdtNzVQK25UaVNDZ0E9IiwiYXBwaWQiOiJhZTUwMDdkMS1hNDRjLTQ3ZTAtYmJlZC03MmY1ZTkxNTA5YjciLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8yN2QxMzdlNS03NjFmLTRkYzEtYWY4OC1kMjY0MzBhYmIxOGYvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiI4ZmI2NDhlOC02YjRiLTQ4NzQtYjYxNC04Zjk0ZTBjZGJlNmIiLCJyaCI6IjEuQVlJQTVUZlJKeDkyd1UydmlOSmtNS3V4andjQUFBQUFBQUFBd0FBQUFBQUFBQUNxQUFDQ0FBLiIsInN1YiI6IjhmYjY0OGU4LTZiNGItNDg3NC1iNjE0LThmOTRlMGNkYmU2YiIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJFVSIsInRpZCI6IjI3ZDEzN2U1LTc2MWYtNGRjMS1hZjg4LWQyNjQzMGFiYjE4ZiIsInV0aSI6Im9fY0c2dmxBRGtTd0VVb2lsMjBqQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfaWRyZWwiOiIzMiA3IiwieG1zX3JkIjoiMC40MkxqWUJKaWFtSVVFdUZnRnhKUXVEQXhKcjlIMDNYcHFmcDVHMTlMc1FGRk9ZVUVEamMxTjUtdC11ZzYwVVhCY2RiZHR6ZUFvaHhDQXV3TUVIQUFTZ01BIn0.hmc0GOdm1NYfbL-5vl7Xm6Gvjaja-P7MYqiQL84x0NsLippK9IyDsHyiuZ--XhVulaylFfAX6yUTvMIsiGg8IX0cq3TweVZ5JygnSSVcp7q9OhVu6HQW0g3t5tmf-iX2y0ykc76VEDkf4ZBcr2otdj31pFspqXfqiGwT_f6UsA5fuFcyOdtNAF45SMSuP7Fr9z9IEYMT6823sCZRswqIZYKzcPJSeirLVkUyDGU0N9TcRHZ_XaBU_jm3GoL5ZkiegnM--2VASKs1icKZa46yspT8PvRgrV1bu37lYryhoHw9xrZwv9_85k-soAcK7inC387ENWfk6_ERdRUWVFU2KA"
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