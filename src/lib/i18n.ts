// Language management system
export interface LanguageStrings {
    [key: string]: string;
  }
  
  export interface Language {
    code: string;
    name: string;
    strings: LanguageStrings;
  }
  
  export interface LongText {
    variable: string;
    description: string;
    content: { [languageCode: string]: string };
  }
  
  class I18nService {
    private currentLanguage = 'en';
    private languages: Language[] = [];
    private longTexts: LongText[] = [];
    
    // Initialize with default English strings
    constructor() {
      this.initializeDefaultLanguages();
    }
    
    private initializeDefaultLanguages() {
      this.languages = [
        {
          code: 'en',
          name: 'English',
          strings: this.getDefaultEnglishStrings()
        }
      ];
    }
    
    private getDefaultEnglishStrings(): LanguageStrings {
      return {
        // Navigation
        'nav_home': 'Home',
        'nav_my_page': 'My Page',
        'nav_my_club': 'My Club',
        'nav_workouts': 'Workouts',
        'nav_analytics': 'Analytics',
        'nav_settings': 'Settings',
        'nav_login': 'Login',
        'nav_register': 'Register',
        'nav_get_started': 'Join',
        
        // Buttons
        'btn_add': 'Add',
        'btn_edit': 'Edit',
        'btn_delete': 'Delete',
        'btn_save': 'Save',
        'btn_cancel': 'Cancel',
        'btn_submit': 'Submit',
        'btn_confirm': 'Confirm',
        'btn_print': 'Print',
        'btn_export': 'Export',
        'btn_import': 'Import',
        
        // Workout Terms
        'workout_add_new': 'Add New Workout',
        'workout_edit': 'Edit Workout',
        'workout_delete': 'Delete Workout',
        'workout_save': 'Save Workout',
        'workout_copy': 'Copy Workout',
        'workout_move': 'Move Workout',
        'workout_share': 'Share Workout',
        
        // Moveframe Terms
        'moveframe_add': 'Add Moveframe',
        'moveframe_edit': 'Edit Moveframe',
        'moveframe_delete': 'Delete Moveframe',
        'moveframe_standard': 'Standard',
        'moveframe_battery': 'Battery',
        'moveframe_annotation': 'Annotation',
        
        // Settings
        'settings_title': 'Settings',
        'settings_backgrounds': 'Backgrounds & Colors',
        'settings_tools': 'Tools Settings',
        'settings_favourites': 'Favourites',
        'settings_my_best': 'My Best',
        'settings_languages': 'Languages',
        'settings_grid': 'Grid & Display',
        
        // Common
        'loading': 'Loading...',
        'success': 'Success',
        'error': 'Error',
        'warning': 'Warning',
        'info': 'Information'
      };
    }
    
    // Get string by key
    t(key: string): string {
      const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
      return currentLang?.strings[key] || this.languages[0]?.strings[key] || key;
    }
    
    // Add new language
    addLanguage(language: Language) {
      this.languages.push(language);
    }
    
    // Set current language
    setLanguage(code: string) {
      this.currentLanguage = code;
    }
    
    // Get all languages
    getLanguages(): Language[] {
      return this.languages;
    }
    
    // Long texts management
    addLongText(longText: LongText) {
      this.longTexts.push(longText);
    }
    
    getLongTexts(): LongText[] {
      return this.longTexts;
    }
    
    getLongText(variable: string, languageCode?: string): string {
      const text = this.longTexts.find(t => t.variable === variable);
      const lang = languageCode || this.currentLanguage;
      return text?.content[lang] || text?.content['en'] || variable;
    }
  }
  
  export const i18n = new I18nService();