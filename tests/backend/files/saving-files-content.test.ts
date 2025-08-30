import { registerUser } from "../utils";

describe("Saving Files Content", () => {
  test("should save and retrieve file content", async () => {
    const { user } = await registerUser("testuser");
    globalThis.testActor.setIdentity(user);

    const file = await globalThis.testActor.create_new_file(
      `test_${Date.now()}.md`,
      [],
    );
    const content = [
      {
        id: "1",
        _type: "paragraph",
        value: "TEST",
        data: [],
        text: "MYTESTSAMPLEHERE",
        children: [],
        language: "",
        list_style_type: "",
        indent: 0n,
        list_start: 0n,
        formats: [],
        parent: [],
      },
    ];

    const res = await globalThis.testActor.multi_updates(
      [file],
      [[[file.id, content]]],
      [],
      [],
    );
    expect("Ok" in res).toBe(true);

    const retrieved = await globalThis.testActor.get_file_content(file.id);
    expect(retrieved[0][0].text).toBe("MYTESTSAMPLEHERE");
  });
});
