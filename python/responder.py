import random

TEMPLATES = {
    'en': [
        "Hi! I'm a freelance web developer. I can help you build a modern and responsive portfolio. Feel free to DM me if you're interested.",
        "Hello! I build websites and portfolios for clients who need a professional online presence. Let me know if you want to discuss your project.",
        "Hi there! I can help create a polished portfolio or website tailored to your needs. Message me privately if you'd like a quote."
    ],
    'fr': [
        "Bonjour ! Je suis développeur web freelance et je peux vous aider à créer un portfolio moderne et responsive. N'hésitez pas à me contacter en privé.",
        "Salut ! Je peux vous aider à concevoir un site ou portfolio professionnel adapté à votre projet. Contactez-moi en privé si vous souhaitez en discuter.",
        "Bonjour ! Je développe des solutions web et des portfolios modernes. Si vous avez besoin d'un site, je peux vous aider."
    ],
    'es': [
        "¡Hola! Soy desarrollador web freelance y puedo ayudarte a crear un portfolio moderno y responsive. Puedes enviarme un mensaje privado si estás interesado.",
        "Hola, puedo ayudarte a construir un sitio web o portfolio profesional para tu proyecto. Escríbeme por privado si te interesa.",
        "¡Saludos! Desarrollo sitios y portfolios modernos adaptados a tus necesidades. Contáctame si quieres discutir tu proyecto."
    ],
    'ar': [
        "مرحباً! أنا مطور ويب مستقل ويمكنني مساعدتك في إنشاء موقع شخصي أو Portfolio حديث ومتجاوب. يمكنك مراسلتي في الخاص.",
        "أهلاً! أساعد في بناء مواقع ومشاريع شخصية احترافية تناسب احتياجك. راسلني في الخاص إذا رغبت في مناقشة المشروع.",
        "مرحباً! أعمل على تصميم مواقع ومنصات حديثة ومخصصة. يمكنك مراسلتي إذا كنت بحاجة إلى موقع أو portfolio."
    ]
}


def generate_reply(text: str, language: str = 'en', category: str = 'other') -> str:
    lang = language.lower() if language else 'en'
    templates = TEMPLATES.get(lang, TEMPLATES['en'])
    base = random.choice(templates)

    if category == 'portfolio':
        if lang == 'fr':
            return "Bonjour ! Je peux vous aider à créer un portfolio moderne, rapide et bien pensé pour mettre en valeur votre travail. Je peux aussi vous conseiller sur le design et les fonctionnalités."
        if lang == 'es':
            return "¡Hola! Puedo ayudarte a crear un portfolio moderno, rápido y atractivo para mostrar tu trabajo de forma profesional. Si quieres, te ayudo con diseño y desarrollo."
        if lang == 'ar':
            return "مرحباً! أستطيع مساعدتك في إنشاء Portfolio حديث وسريع يعرض أعمالك بشكل احترافي. يمكنني أيضًا مساعدتك في التصميم والوظائف المطلوبة."
        return "Hi! I can help you create a modern, fast and professional portfolio that showcases your work effectively."

    if category == 'landing_page':
        if lang == 'fr':
            return "Bonjour ! Je peux créer une landing page efficace pour convertir vos visiteurs en clients. Je peux vous proposer une structure claire et un design moderne."
        if lang == 'es':
            return "¡Hola! Puedo crear una landing page efectiva para convertir visitantes en clientes, con un diseño claro y moderno."
        if lang == 'ar':
            return "مرحباً! أستطيع تصميم landing page فعالة لتحويل الزوار إلى عملاء باستخدام تصميم واضح وعصري."
        return "Hi! I can build an effective landing page that turns visitors into clients with a clean, conversion-focused design."

    if category == 'wordpress':
        if lang == 'fr':
            return "Bonjour ! Je peux vous aider à créer ou personnaliser un site WordPress moderne, rapide et facile à gérer."
        if lang == 'es':
            return "¡Hola! Puedo ayudarte a crear o personalizar un sitio WordPress moderno, rápido y fácil de gestionar."
        if lang == 'ar':
            return "مرحباً! أستطيع مساعدتك في إنشاء أو تخصيص موقع WordPress حديث وسريع وسهل الإدارة."
        return "Hi! I can help you create or customize a modern WordPress site that is fast and easy to manage."

    return base
