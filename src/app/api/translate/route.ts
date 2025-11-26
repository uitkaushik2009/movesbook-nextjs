import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguages } = await request.json();

    if (!text || !targetLanguages || !Array.isArray(targetLanguages)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Google Translate API key is configured
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!apiKey) {
      // Fallback: Use free LibreTranslate API or return mock translations
      console.warn('Google Translate API key not found, using fallback translation');
      return useFallbackTranslation(text, targetLanguages);
    }

    // Use Google Translate API
    const translations: Record<string, string> = { en: text };

    for (const lang of targetLanguages) {
      if (lang === 'en') continue;

      try {
        const response = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: text,
              source: 'en',
              target: lang,
              format: 'text',
            }),
          }
        );

        const data = await response.json();

        if (data.data && data.data.translations && data.data.translations[0]) {
          translations[lang] = data.data.translations[0].translatedText;
        } else {
          translations[lang] = `[Translation failed for ${lang}]`;
        }
      } catch (error) {
        console.error(`Error translating to ${lang}:`, error);
        translations[lang] = `[Error: ${lang}]`;
      }
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

// Fallback translation using free LibreTranslate API
async function useFallbackTranslation(text: string, targetLanguages: string[]) {
  try {
    const translations: Record<string, string> = { en: text };

    // Language code mapping for LibreTranslate
    // LibreTranslate uses different codes for some languages
    const languageCodeMap: Record<string, string> = {
      'en': 'en',
      'fr': 'fr',
      'de': 'de',
      'it': 'it',
      'es': 'es',
      'pt': 'pt',
      'ru': 'ru',
      'hi': 'hi',
      'zh': 'zh',
      'ar': 'ar',
    };

    // Try LibreTranslate (free, open-source) for each language
    for (const lang of targetLanguages) {
      if (lang === 'en') continue;

      const libreTranslateCode = languageCodeMap[lang] || lang;

      try {
        const response = await fetch('https://libretranslate.com/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: libreTranslateCode,
            format: 'text',
          }),
        });

        if (!response.ok) {
          throw new Error(`LibreTranslate HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.translatedText) {
          translations[lang] = data.translatedText;
        } else {
          // If LibreTranslate fails, use simple word-for-word mapping
          translations[lang] = getSimpleTranslation(text, lang);
        }
      } catch (error) {
        console.error(`LibreTranslate error for ${lang}:`, error);
        translations[lang] = getSimpleTranslation(text, lang);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Fallback translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

// Simple translation fallback with common words
function getSimpleTranslation(text: string, lang: string): string {
  const commonTranslations: Record<string, Record<string, string>> = {
    fr: {
      'Home': 'Accueil',
      'Login': 'Connexion',
      'Logout': 'Déconnexion',
      'Settings': 'Paramètres',
      'Profile': 'Profil',
      'Dashboard': 'Tableau de bord',
      'Welcome': 'Bienvenue',
      'Hello': 'Bonjour',
      'Yes': 'Oui',
      'No': 'Non',
      'Save': 'Enregistrer',
      'Cancel': 'Annuler',
      'Delete': 'Supprimer',
      'Edit': 'Modifier',
      'Search': 'Rechercher',
      'New': 'Nouveau',
      'Add': 'Ajouter',
      'Remove': 'Retirer',
      'Update': 'Mettre à jour',
      'Create': 'Créer',
    },
    de: {
      'Home': 'Startseite',
      'Login': 'Anmelden',
      'Logout': 'Abmelden',
      'Settings': 'Einstellungen',
      'Profile': 'Profil',
      'Dashboard': 'Dashboard',
      'Welcome': 'Willkommen',
      'Hello': 'Hallo',
      'Yes': 'Ja',
      'No': 'Nein',
      'Save': 'Speichern',
      'Cancel': 'Abbrechen',
      'Delete': 'Löschen',
      'Edit': 'Bearbeiten',
      'Search': 'Suchen',
      'New': 'Neu',
      'Add': 'Hinzufügen',
      'Remove': 'Entfernen',
      'Update': 'Aktualisieren',
      'Create': 'Erstellen',
    },
    es: {
      'Home': 'Inicio',
      'Login': 'Iniciar sesión',
      'Logout': 'Cerrar sesión',
      'Settings': 'Configuración',
      'Profile': 'Perfil',
      'Dashboard': 'Panel',
      'Welcome': 'Bienvenido',
      'Hello': 'Hola',
      'Yes': 'Sí',
      'No': 'No',
      'Save': 'Guardar',
      'Cancel': 'Cancelar',
      'Delete': 'Eliminar',
      'Edit': 'Editar',
      'Search': 'Buscar',
      'New': 'Nuevo',
      'Add': 'Agregar',
      'Remove': 'Quitar',
      'Update': 'Actualizar',
      'Create': 'Crear',
    },
    it: {
      'Home': 'Home',
      'Login': 'Accedi',
      'Logout': 'Esci',
      'Settings': 'Impostazioni',
      'Profile': 'Profilo',
      'Dashboard': 'Dashboard',
      'Welcome': 'Benvenuto',
      'Hello': 'Ciao',
      'Yes': 'Sì',
      'No': 'No',
      'Save': 'Salva',
      'Cancel': 'Annulla',
      'Delete': 'Elimina',
      'Edit': 'Modifica',
      'Search': 'Cerca',
      'New': 'Nuovo',
      'Add': 'Aggiungi',
      'Remove': 'Rimuovi',
      'Update': 'Aggiorna',
      'Create': 'Crea',
    },
    pt: {
      'Home': 'Início',
      'Login': 'Entrar',
      'Logout': 'Sair',
      'Settings': 'Configurações',
      'Profile': 'Perfil',
      'Dashboard': 'Painel',
      'Welcome': 'Bem-vindo',
      'Hello': 'Olá',
      'Yes': 'Sim',
      'No': 'Não',
      'Save': 'Salvar',
      'Cancel': 'Cancelar',
      'Delete': 'Excluir',
      'Edit': 'Editar',
      'Search': 'Buscar',
      'New': 'Novo',
      'Add': 'Adicionar',
      'Remove': 'Remover',
      'Update': 'Atualizar',
      'Create': 'Criar',
    },
    ru: {
      'Home': 'Главная',
      'Login': 'Войти',
      'Logout': 'Выйти',
      'Settings': 'Настройки',
      'Profile': 'Профиль',
      'Dashboard': 'Панель',
      'Welcome': 'Добро пожаловать',
      'Hello': 'Привет',
      'Yes': 'Да',
      'No': 'Нет',
      'Save': 'Сохранить',
      'Cancel': 'Отмена',
      'Delete': 'Удалить',
      'Edit': 'Редактировать',
      'Search': 'Поиск',
      'New': 'Новый',
      'Add': 'Добавить',
      'Remove': 'Удалить',
      'Update': 'Обновить',
      'Create': 'Создать',
    },
    hi: {
      'Home': 'होम',
      'Login': 'लॉगिन',
      'Logout': 'लॉगआउट',
      'Settings': 'सेटिंग्स',
      'Profile': 'प्रोफ़ाइल',
      'Dashboard': 'डैशबोर्ड',
      'Welcome': 'स्वागत है',
      'Hello': 'नमस्ते',
      'Yes': 'हाँ',
      'No': 'नहीं',
      'Save': 'सहेजें',
      'Cancel': 'रद्द करें',
      'Delete': 'हटाएं',
      'Edit': 'संपादित करें',
      'Search': 'खोजें',
      'New': 'नया',
      'Add': 'जोड़ें',
      'Remove': 'हटाएं',
      'Update': 'अपडेट करें',
      'Create': 'बनाएं',
    },
    zh: {
      'Home': '首页',
      'Login': '登录',
      'Logout': '登出',
      'Settings': '设置',
      'Profile': '个人资料',
      'Dashboard': '仪表板',
      'Welcome': '欢迎',
      'Hello': '你好',
      'Yes': '是',
      'No': '否',
      'Save': '保存',
      'Cancel': '取消',
      'Delete': '删除',
      'Edit': '编辑',
      'Search': '搜索',
      'New': '新建',
      'Add': '添加',
      'Remove': '移除',
      'Update': '更新',
      'Create': '创建',
    },
    ar: {
      'Home': 'الصفحة الرئيسية',
      'Login': 'تسجيل الدخول',
      'Logout': 'تسجيل الخروج',
      'Settings': 'الإعدادات',
      'Profile': 'الملف الشخصي',
      'Dashboard': 'لوحة التحكم',
      'Welcome': 'مرحبا',
      'Hello': 'مرحبا',
      'Yes': 'نعم',
      'No': 'لا',
      'Save': 'حفظ',
      'Cancel': 'إلغاء',
      'Delete': 'حذف',
      'Edit': 'تعديل',
      'Search': 'بحث',
      'New': 'جديد',
      'Add': 'إضافة',
      'Remove': 'إزالة',
      'Update': 'تحديث',
      'Create': 'إنشاء',
    },
  };

  // Check if we have a direct translation
  if (commonTranslations[lang] && commonTranslations[lang][text]) {
    return commonTranslations[lang][text];
  }

  // Try to translate word by word
  const words = text.split(' ');
  const translatedWords = words.map(word => {
    // Check with capital first letter
    const capitalWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    if (commonTranslations[lang] && commonTranslations[lang][capitalWord]) {
      return commonTranslations[lang][capitalWord];
    }
    // Check lowercase
    if (commonTranslations[lang] && commonTranslations[lang][word.toLowerCase()]) {
      return commonTranslations[lang][word.toLowerCase()];
    }
    return word;
  });

  const result = translatedWords.join(' ');
  
  // If no translation found, indicate it clearly
  return result === text ? `[${lang.toUpperCase()}] ${text}` : result;
}

