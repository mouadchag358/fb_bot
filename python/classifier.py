from analyzer import detect_category


def classify_text(text: str, language: str = 'en'):
    return detect_category(text, language)
