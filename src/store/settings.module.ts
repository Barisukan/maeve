import { ActionTree, MutationTree, GetterTree } from 'vuex';

import {
  SettingsState,
  CreateNewThemeActionPayload,
  SetThemeMutationPayload,
  UpdateThemeActionPayload,
  SelectThemeActionPayload
} from './types';
import { ThemeOption } from '@/@types/model/model';
import { defaultThemes, isLight } from '@/themes';
import {
  CREATE_THEME,
  UPDATE_THEME,
  DELETE_THEME,
  LOAD_CUSTOM_THEME,
  SELECT_THEME,
  LOAD_SETTINGS,
  SELECT_BUTTON_STYLES,
  SELECT_PLAYBACK_BITRATE
} from './actions.type';
import {
  ADD_ONE_THEME,
  DELETE_THEME_MUTATION,
  SET_CUSTOM_THEMES,
  SET_THEME,
  SET_SELECTED_THEME,
  SET_BUTTON_STYLE,
  SET_PLAYBACK_BITRATE
} from './mutations.type';
import Vue from 'vue';
import { ButtonStyle, PlaybackBitrate } from '@/utils/constants';

const MAEVE_CUSTOM_THEMES = 'MAEVE_CUSTOM_THEMES';
const MAEVE_SELECTED_THEME = 'MAEVE_SELECTED_THEME';
const MAEVE_BUTTON_STYLE = 'MAEVE_BUTTON_STYLE';
const MAEVE_PLAYBACK_BITRATE = 'MAEVE_PLAYBACK_BITRATE';

const initialState: SettingsState = {
  defaultThemes,
  buttonStyle: ButtonStyle.normal,
  customThemes: [],
  selectedTheme: defaultThemes[0], // the first theme is the default,
  playbackBitrate: PlaybackBitrate.STANDARD
};

const getters: GetterTree<SettingsState, any> = {
  themes(state): ThemeOption[] {
    return state.defaultThemes.concat(state.customThemes);
  },

  darkMode(state): boolean {
    return !isLight(state.selectedTheme.primary);
  }
};

const actions: ActionTree<SettingsState, any> = {
  [CREATE_THEME]({ state, commit }, payload: CreateNewThemeActionPayload) {
    const {
      accent,
      primary,
      secondary,
      name,
      primaryText,
      secondaryText
    } = payload;
    const id = `Theme-${Date.now()}`;

    const newTheme: ThemeOption = {
      id,
      accent,
      name,
      primary,
      secondary,
      primaryText,
      secondaryText,
      editable: true
    };

    commit(ADD_ONE_THEME, newTheme);
    localStorage.setItem(
      MAEVE_CUSTOM_THEMES,
      JSON.stringify(state.customThemes)
    );
  },

  [UPDATE_THEME](
    { state, commit, dispatch },
    { theme }: UpdateThemeActionPayload
  ) {
    commit(SET_THEME, {
      id: theme.id,
      theme
    });

    localStorage.setItem(
      MAEVE_CUSTOM_THEMES,
      JSON.stringify(state.customThemes)
    );

    if (theme.id === state.selectedTheme.id) {
      dispatch(SELECT_THEME, { theme });
    }
  },

  [DELETE_THEME]({ state, commit }, themeId: string) {
    commit(DELETE_THEME_MUTATION, themeId);
    localStorage.setItem(
      MAEVE_CUSTOM_THEMES,
      JSON.stringify(state.customThemes)
    );
  },

  [LOAD_CUSTOM_THEME](context) {
    const cutomThemes = JSON.parse(
      localStorage.getItem(MAEVE_CUSTOM_THEMES) || '[]'
    );

    context.commit(SET_CUSTOM_THEMES, cutomThemes);
  },

  [SELECT_THEME]({ state, commit }, { theme }: SelectThemeActionPayload) {
    localStorage.setItem(
      MAEVE_SELECTED_THEME,
      JSON.stringify({ id: theme.id })
    );

    commit(SET_SELECTED_THEME, theme);
  },

  [LOAD_SETTINGS]({ commit, getters, dispatch, rootState }) {
    dispatch(LOAD_CUSTOM_THEME);
    const selectedThemeStr = localStorage.getItem(MAEVE_SELECTED_THEME);
    const buttonStyle = localStorage.getItem(MAEVE_BUTTON_STYLE);

    if (selectedThemeStr) {
      const selectedThemeId =
        JSON.parse(selectedThemeStr).id || defaultThemes[0].id;

      const selectedTheme =
        getters.themes.find(
          (theme: ThemeOption) => theme.id === selectedThemeId
        ) || defaultThemes[0];

      commit(SET_SELECTED_THEME, selectedTheme);
    }

    if (buttonStyle) {
      commit(SET_BUTTON_STYLE, buttonStyle);
    }

    const bitrate =
      localStorage.getItem(MAEVE_PLAYBACK_BITRATE) || PlaybackBitrate.STANDARD;
    if (bitrate) {
      dispatch(SELECT_PLAYBACK_BITRATE, +bitrate);
    }
  },

  [SELECT_BUTTON_STYLES](context, buttonStyle: ButtonStyle) {
    localStorage.setItem(MAEVE_BUTTON_STYLE, buttonStyle);
    context.commit(SET_BUTTON_STYLE, buttonStyle);
  },

  [SELECT_PLAYBACK_BITRATE](context, bitrate: PlaybackBitrate) {
    const musicKitInstance = MusicKit.getInstance();

    if (!musicKitInstance) {
      return;
    }

    musicKitInstance.bitrate = bitrate as number;
    localStorage.setItem(MAEVE_PLAYBACK_BITRATE, bitrate.toString());
    context.commit(SET_PLAYBACK_BITRATE, bitrate);
  }
};

const mutations: MutationTree<SettingsState> = {
  [ADD_ONE_THEME](state, theme: ThemeOption) {
    state.customThemes.push(theme);
  },

  [SET_CUSTOM_THEMES](state, themes: ThemeOption[]) {
    state.customThemes = themes;
  },

  [SET_THEME](state, { id, theme }: SetThemeMutationPayload) {
    const themeToUpdate = state.customThemes.find(theme => theme.id === id);

    if (themeToUpdate) {
      // themeToUpdate.name = theme.name;
      // themeToUpdate.primary = theme.primary;
      // themeToUpdate.secondary = theme.secondary;
      // themeToUpdate.accent = theme.accent;

      Vue.set(themeToUpdate, 'name', theme.name);
      Vue.set(themeToUpdate, 'primary', theme.primary);
      Vue.set(themeToUpdate, 'secondary', theme.secondary);
      Vue.set(themeToUpdate, 'accent', theme.accent);
      Vue.set(themeToUpdate, 'primaryText', theme.primaryText);
      Vue.set(themeToUpdate, 'secondaryText', theme.secondaryText);
    }
  },

  [DELETE_THEME_MUTATION](state, themeId: string) {
    state.customThemes = state.customThemes.filter(
      theme => theme.id !== themeId
    );
  },

  [SET_SELECTED_THEME](state, theme: ThemeOption) {
    state.selectedTheme = theme;
  },

  [SET_BUTTON_STYLE](state, buttonStyle: ButtonStyle) {
    state.buttonStyle = buttonStyle;
  },

  [SET_PLAYBACK_BITRATE](state, bitrate: PlaybackBitrate) {
    state.playbackBitrate = bitrate;
  }
};

export default {
  state: initialState,
  getters,
  actions,
  mutations
};
