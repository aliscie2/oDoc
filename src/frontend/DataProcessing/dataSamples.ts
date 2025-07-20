import { Principal } from "@dfinity/principal";
import {
  Column,
  CustomContract,
  Share,
  SharePaymentOption,
  SharesContract,
} from "../../declarations/backend/backend.did";

const paymentContractId = randomString();
const sharesContractId = randomString();
const firstShareId = randomString();

export const custom_contract: CustomContract = {
  id: "change_later",
  name: "Custom contract",
  creator: Principal.fromText("2vxsx-fae"),
  date_created: Date.now() * 1e6,
  payments: [],
  promises: [],
  contracts: [],
  formulas: [],
  date_updated: 0,
  permissions: [],
};

export const note_page_content = [
  { id: 4, children: [{ id: 5, text: "", type: "h1" }] },
];
export const file_data = {
  id: "0000",
  content: "0",
  name: "NameTest",
  children: {},
  parent: [],
};
const column: Column = {
  _type: "",
  field: "receiver",
  filters: [],
  permissions: [],
  dataValidator: [],
  editable: true,
  formula: [],
  id: randomString(),
};
export const dataGrid = {
  id: randomString(),
  children: [
    {
      id: randomString(),
      text: "",
      data: [
        {
          Table: {
            rows: [
              {
                id: randomString(),
                contract: [],
                cells: [
                  [
                    ["name", ""],
                    ["last_name", "x"],
                    ["full_name", "xxxa"],
                  ],
                ],
                requests: [],
              },
            ],
            columns: [
              { ...column, id: randomString(), field: "name" },
              {
                ...column,
                id: randomString(),
                field: "last_name",
              },
              { ...column, id: randomString(), field: "full_name" },
            ],
          },
        },
      ],
    },
  ],
  type: "data_grid",
};

export const sharesContract = {
  id: randomString(),
  children: [
    {
      id: sharesContractId,
      text: "",
      data: [
        {
          Table: {
            rows: [
              {
                id: firstShareId,
                contract: [{ SharesContract: firstShareId }],
                cells: [],
                requests: [],
              },
            ],
            columns: [
              { ...column, id: randomString(), field: "receiver" },
              {
                ...column,
                id: randomString(),
                field: "accumulation",
                editable: false,
              },
              { ...column, id: randomString(), field: "share%" },
              {
                ...column,
                id: randomString(),
                field: "confirmed",
                editable: false,
              },
            ],
          },
        },
      ],
    },
  ],
  type: "shares_contract",
};

export const customContract: CustomContract = {
  id: randomString(),
  name: "Custom contract",
  creator: Principal.fromText("2vxsx-fae"),
  date_created: Date.now() * 1e6,
  payments: [],
  promises: [],
  contracts: [],
  formulas: [],
  date_updated: 0,
  permissions: [],
};

export const slateCustomContract = {
  id: customContract.id,
  children: [
    {
      id: randomString(),
      text: "",
      data: [],
    },
  ],
  type: "custom_contract",
};

export const paymentContract = {
  id: paymentContractId,
  children: [
    {
      id: randomString(),
      text: "",
      data: [
        {
          Table: {
            rows: [
              {
                id: paymentContractId,
                contract: [{ PaymentContract: paymentContractId }],
                cells: [],
                requests: [],
              },
            ],
            columns: [
              { ...column },
              { ...column, id: randomString(), field: "amount" },
              {
                ...column,
                id: randomString(),
                field: "released",
              },
              // {...column, id: randomString(), field: "confirmed",}
            ],
          },
        },
      ],
    },
  ],
  type: "payment_contract",
};

export const fileContentSample = [{ type: "p", children: [{ text: "" }] }];
export const payment_contract_row = { Contract: { PaymentContract: "0" } };
export const payment_contract_row2 = { Contract: { PaymentContract: "1" } };

export const contracts_sample = {
  "4": {
    contract_id: "4",
    sender: {
      id: "l5gd7-bl4bd-jodqy-yqblz-eawxr-w4fdt-eqxhj-luwyp-nav4q-fs66j-xae",
      name: "d",
      description: "d",
      photo: {},
    },
    released: false,
    confirmed: false,
    amount: "200",
    receiver: {
      id: "l5gd7-bl4bd-jodqy-yqblz-eawxr-w4fdt-eqxhj-luwyp-nav4q-fs66j-xae",
      name: "d",
      description: "d",
      photo: {},
    },
  },
  "18": {
    contract_id: "18",
    sender: {
      id: "l5gd7-bl4bd-jodqy-yqblz-eawxr-w4fdt-eqxhj-luwyp-nav4q-fs66j-xae",
      name: "d",
      description: "d",
      photo: {},
    },
    released: false,
    confirmed: false,
    amount: "150",
    receiver: {
      id: "l5gd7-bl4bd-jodqy-yqblz-eawxr-w4fdt-eqxhj-luwyp-nav4q-fs66j-xae",
      name: "d",
      description: "d",
      photo: {},
    },
  },
};
export const paymentContractSample: PaymentContract = {
  contract_id: paymentContractId,
  sender: Principal.fromText("2vxsx-fae")!,
  receiver: Principal.fromText("2vxsx-fae")!,
  released: false,
  confirmed: false,
  canceled: false,
  amount: BigInt(0),
  objected: [], // or ["some string value"] if you want it to be non-empty
  extra_cells: [],
};

const shareSample: Share = {
  share_contract_id: firstShareId,
  accumulation: BigInt(0),
  confirmed: false,
  share: BigInt(100),
  receiver: Principal.fromText("2vxsx-fae"),
  extra_cells: [],
};

const paymentOption: SharePaymentOption = {
  id: "",
  title: "",
  date: "",
  description: "",
  amount: BigInt(0),
};
export const sharesContractSample: SharesContract = {
  shares: [shareSample],
  payments: [],
  contract_id: sharesContractId,
  shares_requests: [],
  payment_options: [paymentOption],
  author: "2vxsx-fae",
};

export const contractIdSample = { Contract: { PaymentContract: "18" } };

export function randomString() {
  return Math.random().toString(36).substring(2, 8);
}
