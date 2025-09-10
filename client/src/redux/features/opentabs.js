// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   tabs: [],
// };

// export const openTabs = createSlice({
//   name: "openTabs",
//   initialState,
//   reducers: {
//     push: (state, action) => {
//       const existingIndex = state.tabs.findIndex(
//         (item) => item.name === action.payload.name
//       );
//       state.tabs = state.tabs.map((tab) => {
//         return { ...tab, active: false };
//       });
//       if (existingIndex >= 0) {
//         state.tabs[existingIndex] = {
//           ...state.tabs[existingIndex],
//           active: true,
//           projectId: action.payload.projectId, projectForm: action.payload.projectForm
//         };
//       } else {
//         state.tabs.push({ id: action.payload.id, name: action.payload.name, active: true, projectId: action.payload.projectId, projectForm: action.payload.projectForm });
//       }
//       localStorage.setItem("openTabs", JSON.stringify(state.tabs));
//     },
//     remove: (state, action) => {
//       const existingIndex = state.tabs.findIndex(
//         (item) => item.name === action.payload.name
//       );
//       if (state.tabs[existingIndex]?.active) {
//         if (state.tabs.length > 1) {
//           state.tabs = state.tabs.map((tab) => {
//             return { ...tab, active: false };
//           });
//           if (existingIndex === state.tabs.length - 1) {
//             state.tabs[existingIndex - 1] = {
//               ...state.tabs[existingIndex - 1],
//               active: true,
//             };
//           } else {
//             state.tabs[existingIndex + 1] = {
//               ...state.tabs[existingIndex + 1],
//               active: true,
//             };
//           }
//         }
//       }
//       state.tabs = state.tabs.filter(tab => tab.name !== action.payload.name);
//       localStorage.setItem("openTabs", JSON.stringify(state.tabs));
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { push, remove } = openTabs.actions;

// export default openTabs.reducer;


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tabs: [],
};

// const initialState = {
//   tabs: JSON.parse(localStorage.getItem("openTabs")) || [],
// };


export const openTabs = createSlice({
  name: "openTabs",
  initialState,
  reducers: {
    push: (state, action) => {

      const existingIndex = state.tabs.findIndex(


        (item) => item.name === action.payload.name

      );
      console.log(existingIndex, "existingIndex")
      state.tabs = state.tabs.map((tab) => {
        return { ...tab, active: false };
      });
      if (existingIndex >= 0) {
        state.tabs[existingIndex] = {
          ...state.tabs[existingIndex],
          active: true,
          projectId: action.payload.projectId, projectForm: action.payload.projectForm
        };
      } else {
        state.tabs.push({ id: action.payload.id, name: action.payload.name, active: true, projectId: action.payload.projectId, projectForm: action.payload.projectForm });
      }
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
    },
    remove: (state, action) => {
      const existingIndex = state.tabs.findIndex(
        (item) => item.name === action.payload.name
      );
      if (state.tabs[existingIndex]?.active) {
        if (state.tabs.length > 1) {
          state.tabs = state.tabs.map((tab) => {
            return { ...tab, active: false };
          });
          if (existingIndex === state.tabs.length - 1) {
            state.tabs[existingIndex - 1] = {
              ...state.tabs[existingIndex - 1],
              active: true,
            };
          } else {
            state.tabs[existingIndex + 1] = {
              ...state.tabs[existingIndex + 1],
              active: true,
            };
          }
        }
      }
      state.tabs = state.tabs.filter(tab => tab.name !== action.payload.name);
      localStorage.setItem("openTabs", JSON.stringify(state.tabs));
    },
  },
});

// Action creators are generated for each case reducer function
export const { push, remove } = openTabs.actions;

export default openTabs.reducer;  
