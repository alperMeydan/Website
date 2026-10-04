#!/usr/bin/env python3
"""Generate full Turkish and Russian static pages from the English site."""
from html import escape
from html.parser import HTMLParser
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'index.html'
translations = {}
for line in (ROOT / 'content/translations.tsv').read_text(encoding='utf-8').splitlines():
    if not line.strip():
        continue
    columns = line.split('|||')
    if len(columns) != 3:
        raise ValueError(f'Invalid translation row: {line[:60]}')
    en, tr, ru = columns
    if en in translations:
        raise ValueError(f'Duplicate translation: {en}')
    translations[en] = {'tr': tr, 'ru': ru}

IDENTITY = {'EN', 'TR', 'RU', 'Abstract Minds', 'Bureau', 'Abstract', 'Minds Bureau.', 'CyberShop', 'Shadow', 'Warriors', 'AMB / DEV', 'const', 'studio = {', 'owner:', '"human"', ',', 'agents: [', '"project_manager"', '"programmer"', '"tester"', '"architecture_checker"', '],', 'merge:', '"owner_approval"', '};', '▍', 'AI Development', 'Studio', 'Aetheria &', 'Endless Forest', 'Shadow Warriors', 'Unity / C#', 'ThoughtsUI', 'AM', 'Alper Meydan', 'abstractmindsbureau@gmail.com', 'Abstract Minds Bureau', '✳', 'English', 'Türkçe', 'Русский'}
ORIGIN = 'https://abstractmindsbureau.com'
SOCIAL_LOCALES = {'tr': 'tr_TR', 'ru': 'ru_RU'}

class Localizer(HTMLParser):
    def __init__(self, lang):
        super().__init__(convert_charrefs=True)
        self.lang = lang
        self.output = []
        self.missing = set()

    def translate(self, value):
        text = value.strip()
        if text in translations:
            before = value[:len(value) - len(value.lstrip())]
            after = value[len(value.rstrip()):]
            return before + translations[text][self.lang] + after
        if text and text not in IDENTITY and not re.fullmatch(r'\d+', text):
            self.missing.add(text)
        return value

    def handle_decl(self, decl):
        self.output.append(f'<!{decl}>')

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'html':
            attributes['lang'] = self.lang
        for key in ['alt', 'aria-label', 'title']:
            if attributes.get(key):
                attributes[key] = self.translate(attributes[key])
        if tag == 'meta':
            name = attributes.get('name')
            prop = attributes.get('property')
            if name in {'description', 'twitter:title', 'twitter:description', 'twitter:image:alt'} or prop in {'og:title', 'og:description', 'og:image:alt'}:
                attributes['content'] = self.translate(attributes['content'])
            if prop == 'og:url':
                attributes['content'] = f'{ORIGIN}/{self.lang}/'
            if prop == 'og:locale':
                attributes['content'] = SOCIAL_LOCALES[self.lang]
        if tag == 'link' and attributes.get('rel') == 'canonical':
            attributes['href'] = f'{ORIGIN}/{self.lang}/'
        if tag == 'a' and 'hreflang' in attributes:
            attributes.pop('aria-current', None)
            if attributes['hreflang'] == self.lang:
                attributes['aria-current'] = 'page'
        rendered = ''.join(f' {key}' if value is None else f' {key}="{escape(value, quote=True)}"' for key, value in attributes.items())
        self.output.append(f'<{tag}{rendered}>')

    def handle_endtag(self, tag):
        self.output.append(f'</{tag}>')

    def handle_data(self, data):
        self.output.append(escape(self.translate(data), quote=False))

    def handle_comment(self, data):
        self.output.append(f'<!--{data}-->')

for lang in ['tr', 'ru']:
    parser = Localizer(lang)
    parser.feed(SOURCE.read_text(encoding='utf-8'))
    if parser.missing:
        raise ValueError(f'Missing {lang} translations: {sorted(parser.missing)}')
    destination = ROOT / lang / 'index.html'
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(''.join(parser.output), encoding='utf-8')
    print(f'{lang}: complete page generated ({len(translations)} translations).')
