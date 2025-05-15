import { describe, expect, test } from "vitest";
import { entityStateFields } from "./DefaultFields";
import { enumMetadata, enumValueMap, optionSet } from "./OptionSet";

enum TestEnum
	{
	One,
	Two,
	Three
}


describe("enum metadata", () =>
{
	test("keyValues", () => 
	{
		const keyValues = enumValueMap(TestEnum);
		expect(keyValues).toEqual({
			0: "One",
			1: "Two",
			2: "Three",
		});
	});

	test("entityStateFields", () => 
	{
		const fields = entityStateFields();
		expect(fields).toMatchObject({
			state:
			{
				schemaName: "statecode",
				type: "optionSet",
				options: {
					optional: false,
					enumMetadata: {
						values: {
							0: "Active",
							1: "Inactive",
						},
					},
				},
			},
			status: {
				schemaName: "statuscode",
				type: "optionSet",
				options: {
					optional: false,
					enumMetadata: {
						values: {
							1: "Active",
							2: "Inactive",
						},
					},
				},
			},
		});
	});

	test("create", () =>
	{
		const metadata = optionSet("test", enumMetadata<TestEnum>(TestEnum));

		expect(metadata).toMatchObject({
			schemaName: "test",
			type: "optionSet",
			options: {
				optional: false,
				enumMetadata: {
					values: {
						0: "One",
						1: "Two",
						2: "Three",
					},
				},
			},
		});
	});
});