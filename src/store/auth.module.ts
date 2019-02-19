import { GetterTree, MutationTree, ActionTree } from 'vuex';

import authService from '@/services/auth.service';
import apiService from '@/services/musicApi.service';
import { AuthState } from './types';
import {
  SET_USER_TOKEN,
  SET_CURRENTLY_PLAYING_SONG,
  SET_QUEUE_VISIBILITY
} from './mutations.type';
import { LOGIN, LOGOUT, RESET_QUEUE } from '@/store/actions.type';

const initialState: AuthState = {
  musicUserToken: authService.userToken
};

const getters: GetterTree<AuthState, any> = {
  isAuthenticated(state): boolean {
    return !!state.musicUserToken;
  }
};

const actions: ActionTree<AuthState, any> = {
  async [LOGIN]({ commit, dispatch }) {
    const userToken = await authService.login();
    await apiService.updateUserStorefront();
    commit(SET_USER_TOKEN, userToken);
    await dispatch(RESET_QUEUE);

    commit(SET_CURRENTLY_PLAYING_SONG, null);
    commit(SET_QUEUE_VISIBILITY, false);
  },

  async [LOGOUT]({ commit, dispatch }) {
    await authService.logout();
    apiService.setUserStorefront('us');
    commit(SET_USER_TOKEN, null);
    await dispatch(RESET_QUEUE);

    commit(SET_CURRENTLY_PLAYING_SONG, null);
    commit(SET_QUEUE_VISIBILITY, false);
  }
};

const mutations: MutationTree<AuthState> = {
  [SET_USER_TOKEN](state, userToken: string | null) {
    state.musicUserToken = userToken;
  }
};

export default {
  state: initialState,
  getters,
  mutations,
  actions
};
