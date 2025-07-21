import { createPluginFactory } from "@udecode/plate-common";
import SlateCustomContract from "./SlateCustomContract";
import {
  insertTableRow,
  insertTableColumn,
} from "@udecode/plate-table";
const CONTRACT_KEY = "custom_contract";

interface Props {
  children: any;
}

// function ContractPlugin(p: Props) {
//     return <div style={{color: 'red'}}>{p.children}</div>;
// }

const createContractPlugin = createPluginFactory({
  key: CONTRACT_KEY,
  isElement: true,
  component: SlateCustomContract,

  // handlers: {
  //   onKeyDown: (editor: PlateEditor, event) => {
  //     // Check if the event is a backspace
  //     if (event.key === "Backspace") {
  //       const { selection } = editor;
  //
  //       if (selection && selection.anchor.offset === 0) {
  //         const [node] = editor.node(selection.anchor.path);
  //         const [parentNode, parentPath] = editor.parent(selection.anchor.path);
  //
  //         // Check if we're in a contract element
  //         if ((parentNode as TElement).type === CONTRACT_KEY) {
  //           // Prevent default backspace behavior
  //           event.preventDefault();
  //
  //           // Custom deletion logic here
  //           // For example, you could:
  //           // 1. Show a confirmation dialog
  //           if (
  //             window.confirm("Are you sure you want to delete this contract?")
  //           ) {
  //             editor.removeNodes({
  //               at: parentPath,
  //             });
  //           }
  //
  //           // 2. Or implement your own deletion rules
  //           // if (someCondition) {
  //           //   editor.removeNodes({
  //           //     at: parentPath,
  //           //   });
  //           // }
  //
  //           return true;
  //         }
  //       }
  //     }
  //     return false;
  //   },
  // },
});

const tableFloatingOptions = {
  floatingToolbar: {
    items: [
      {
        text: "Table",
        children: [
          {
            text: "Add Row Below",
            onClick: (editor) => insertTableRow(editor),
          },
          {
            text: "Add Column After",
            onClick: (editor) => insertTableColumn(editor),
          },
          { text: "Remove Row", onClick: (editor) => deleteTableRow(editor) },
          // {
          //   text: "Remove Column",
          //   onClick: (editor) => deleteTableColumn(editor),
          // },
          // {
          //   text: "Delete Table",
          //   onClick: (editor) => {
          //     const tableEntry = findNode(editor, {
          //       type: getPluginType(editor, ELEMENT_TABLE),
          //     });
          //     if (tableEntry) {
          //       editor.removeNodes({ at: tableEntry[1] });
          //     }
          //   },
          // },
        ],
      },
    ],
  },
};

export { CONTRACT_KEY };
export default createContractPlugin;
