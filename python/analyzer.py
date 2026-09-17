import re
from typing import Dict

MULTI_LANG_KEYWORDS = {
    'fr': {
        'developer': ['developpeur', 'développeur', 'codeur', 'dev', 'programmeur'],
        'website': ['site web', 'site internet', 'site vitrine', 'site', 'site vitrine'],
        'portfolio': ['portfolio', 'cv en ligne', 'projet personnel', 'mon portfolio'],
        'landing_page': ['landing page', 'page de vente', 'page d\'atterrissage'],
        'freelance': ['freelance', 'indépendant', 'independant', 'pigiste'],
        'hire': ['cherche', 'recherche', 'besoin', 'trouver', 'auriez', 'voulais', 'voulons'],
        'app': ['application web', 'web app', 'app web', 'application'],
        'wordpress': ['wordpress'],
        'php': ['php', 'laravel'],
        'node': ['node.js', 'nodejs', 'node'],
        'python': ['python', 'django', 'flask'],
        'javascript': ['javascript', 'js', 'react', 'vue', 'angular'],
        'frontend': ['frontend', 'front-end', 'ui', 'design'],
        'backend': ['backend', 'api', 'serveur'],
        'fullstack': ['fullstack', 'full-stack', 'développeur complet'],
    },
    'en': {
        'developer': ['developer', 'programmer', 'web developer', 'coders', 'dev'],
        'website': ['website', 'web site', 'site', 'site build'],
        'portfolio': ['portfolio', 'personal portfolio', 'portfolio website'],
        'landing_page': ['landing page', 'sales page'],
        'freelance': ['freelance', 'contractor', 'independent', 'freelancer'],
        'hire': ['looking for', 'need', 'need someone', 'searching', 'want', 'looking'],
        'app': ['web application', 'web app', 'application'],
        'wordpress': ['wordpress'],
        'php': ['php', 'laravel'],
        'node': ['node.js', 'nodejs', 'node'],
        'python': ['python', 'django', 'flask'],
        'javascript': ['javascript', 'js', 'react', 'vue', 'angular'],
        'frontend': ['frontend', 'front-end', 'ui', 'design'],
        'backend': ['backend', 'api', 'server'],
        'fullstack': ['fullstack', 'full-stack'],
    },
    'es': {
        'developer': ['desarrollador', 'programador', 'dev'],
        'website': ['sitio web', 'página web', 'web', 'pagina web'],
        'portfolio': ['portfolio', 'portafolio'],
        'landing_page': ['landing page', 'pagina de venta'],
        'freelance': ['freelance', 'independiente', 'autónomo'],
        'hire': ['busco', 'necesito', 'busca', 'quiero', 'buscar'],
        'app': ['aplicación web', 'app web', 'aplicacion web'],
        'wordpress': ['wordpress'],
        'php': ['php', 'laravel'],
        'node': ['node.js', 'nodejs', 'node'],
        'python': ['python', 'django', 'flask'],
        'javascript': ['javascript', 'js', 'react', 'vue', 'angular'],
        'frontend': ['frontend', 'ui', 'diseño'],
        'backend': ['backend', 'api', 'servidor'],
        'fullstack': ['fullstack', 'full-stack'],
    },
    'ar': {
        'developer': ['مطور', 'مبرمج', 'dev'],
        'website': ['موقع', 'موقع إلكتروني', 'موقع ويب'],
        'portfolio': ['بورتفوليو', 'ملف شخصي', 'portfolio'],
        'landing_page': ['صفحة هبوط', 'landing page', 'صفحة بيع'],
        'freelance': ['مستقل', 'فريلانسر', 'freelance'],
        'hire': ['أبحث', 'أحتاج', 'أريد', 'ابحث', 'أرغب'],
        'app': ['تطبيق ويب', 'web app', 'تطبيق'],
        'wordpress': ['wordpress'],
        'php': ['php', 'لارافيل', 'laravel'],
        'node': ['node.js', 'nodejs', 'node'],
        'python': ['python', 'django', 'flask'],
        'javascript': ['javascript', 'js', 'react', 'vue', 'angular'],
        'frontend': ['frontend', 'واجهة', 'ui'],
        'backend': ['backend', 'api', 'خادم'],
        'fullstack': ['fullstack', 'full-stack'],
    }
}

LANGUAGE_PATTERNS = {
    'fr': ['bonjour', 'salut', 'je cherche', 'besoin', 'portfolio', 'site web', 'developpeur'],
    'en': ['hi', 'hello', 'looking for', 'need', 'website', 'developer', 'portfolio'],
    'es': ['hola', 'busco', 'necesito', 'portfolio', 'página web', 'desarrollador'],
    'ar': ['مرحبا', 'أبحث', 'أحتاج', 'موقع', 'مطور', 'portfolio'],
}


def normalize(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip().lower()


def detect_language(text: str) -> str:
    cleaned = normalize(text)
    scores = {lang: 0 for lang in LANGUAGE_PATTERNS}

    for lang, patterns in LANGUAGE_PATTERNS.items():
        for pattern in patterns:
            if pattern in cleaned:
                scores[lang] += 2

    for lang, keyword_map in MULTI_LANG_KEYWORDS.items():
        for category_keywords in keyword_map.values():
            for keyword in category_keywords:
                if keyword in cleaned:
                    scores[lang] += 1

    best_lang = max(scores, key=scores.get)
    if scores[best_lang] <= 0:
        return 'en'
    return best_lang


def detect_category(text: str, language: str) -> str:
    cleaned = normalize(text)
    keyword_map = MULTI_LANG_KEYWORDS.get(language, MULTI_LANG_KEYWORDS['en'])

    for category, keywords in keyword_map.items():
        for keyword in keywords:
            if keyword in cleaned:
                return category

    # Fallback: infer from general terms
    if 'portfolio' in cleaned or 'portafolio' in cleaned or 'بورتفوليو' in cleaned:
        return 'portfolio'
    if 'landing' in cleaned or 'page de vente' in cleaned or 'صفحة هبوط' in cleaned:
        return 'landing_page'
    if 'wordpress' in cleaned:
        return 'wordpress'
    if 'ecommerce' in cleaned or 'shop' in cleaned or 'boutique' in cleaned:
        return 'ecommerce'
    if 'mobile' in cleaned or 'application mobile' in cleaned or 'android' in cleaned or 'ios' in cleaned:
        return 'mobile'
    if 'python' in cleaned:
        return 'python'
    if 'javascript' in cleaned or 'react' in cleaned or 'node' in cleaned:
        return 'javascript'
    if 'php' in cleaned or 'laravel' in cleaned:
        return 'php'
    if 'site web' in cleaned or 'website' in cleaned or 'sitio web' in cleaned:
        return 'website'
    return 'other'


def analyze_text(text: str) -> Dict[str, str | int]:
    language = detect_language(text)
    category = detect_category(text, language)
    score = 0
    intent = 'unknown'

    lowered = normalize(text)
    if any(token in lowered for token in ['looking for a developer', 'cherche un développeur', 'busco un desarrollador', 'أبحث عن مطور', 'developer wanted', 'need a developer']):
        score += 30
        intent = 'hire_developer'
    if any(token in lowered for token in ['need a website', 'besoin d\'un site web', 'necesito una página web', 'أحتاج موقع إلكتروني']):
        score += 25
    if 'portfolio' in lowered or 'portafolio' in lowered or 'بورتفوليو' in lowered:
        score += 25
    if any(token in lowered for token in ['freelance', 'independant', 'indépendant', 'مستقل', 'freelancer']):
        score += 20
    if any(token in lowered for token in ['looking for', 'cherche', 'busco', 'أبحث', 'need someone', 'need', 'recherche']):
        score += 15
    if any(token in lowered for token in ['budget', 'prix', 'cost', 'devise', 'tarif', 'ميزانية']):
        score += 10
    if any(token in lowered for token in ['deadline', 'urgent', 'asap', 'quickly', 'délai', 'date limite', 'مواعيد', 'سريع']):
        score += 10

    score = min(score, 100)

    if score >= 70:
        reason = 'The author clearly needs a web-related service or developer.'
    elif score >= 50:
        reason = 'This looks like a potential web service opportunity that should be reviewed.'
    else:
        reason = 'This is weakly related to a web development need.'

    return {
        'language': language,
        'category': category,
        'score': score,
        'intent': intent,
        'reason': reason,
    }
