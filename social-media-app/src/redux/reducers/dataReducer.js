import { POST_SCREAM, SET_SCREAMS, SET_SCREAM, LIKE_SCREAM, UNLIKE_SCREAM, LOADING_DATA, DELETE_SCREAM } from "../types";

const initialState = {
  screams: [],
  scream: {},
  loading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOADING_DATA: {
      return {
        ...state,
        loading: true,
      };
    }

    case SET_SCREAMS: {
      return {
        ...state,
        screams: action.payload,
        loading: false,
      };
    }
    case SET_SCREAM: {
      return {
        ...state,
        scream: action.payload,
      };
    }
    case UNLIKE_SCREAM:
    case LIKE_SCREAM: {
      let index = state.screams.findIndex((scream) => scream.screamId === action.payload.screamId);
      state.screams[index] = action.payload;
      if (state.scream.screamId === action.payload.screamId) {
        state.scream = action.payload;
      }
      return {
        ...state,
      };
    }
    case LOADING_DATA: {
      return {
        ...state,
        loading: true,
      };
    }
    case DELETE_SCREAM: {
      let index = state.screams.findIndex((scream) => scream.screamId === action.payload);
      state.screams.splice(index, 1);
      return {
        ...state,
      };
    }
    case POST_SCREAM:
      return {
        ...state,
        screams: [action.payload, ...state.screams],
      };
    default:
      return state;
  }
}
