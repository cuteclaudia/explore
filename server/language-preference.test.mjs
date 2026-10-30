import test from 'node:test';import assert from 'node:assert/strict';
import {matchBrowserLanguage,resolveLanguagePreference} from '../src/lib/locales/preference.mjs';
test('browser language matching handles supported regional and Chinese script variants',()=>{
 for(const [input,want] of [['en-US','en'],['ja-JP','ja'],['fr-CA','fr'],['de-AT','de'],['pt-BR','pt-PT'],['nl-BE','nl'],['uk-UA','uk'],['th-TH','th'],['id-ID','id'],['no-NO','nb'],['nb-NO','nb'],['zh-TW','zh-Hant'],['zh-HK','zh-Hant'],['zh-SG','zh-Hans'],['zh-CN','zh-Hans'],['zh-Hant-CN','zh-Hant'],['zh-Hans-TW','zh-Hans']])assert.equal(matchBrowserLanguage([input]),want,input);
});
test('browser preferences use the first supported language and safe English fallback',()=>{
 assert.equal(matchBrowserLanguage(['ru-RU','fr-FR','ja-JP']),'fr');assert.equal(matchBrowserLanguage(['nn-NO','sv-SE']),'sv');
 for(const input of [null,[],['xx-INVALID'],['__proto__'],[null,{}],['<script>'],['x'.repeat(100)]])assert.equal(matchBrowserLanguage(input),'en');
});
test('manual saved choice wins; explicit device mode ignores URL hints; detection does not imply a saved choice',()=>{
 assert.equal(resolveLanguagePreference('fr','ja',['de-DE']),'fr');assert.equal(resolveLanguagePreference('system','ja',['de-DE']),'de');
 assert.equal(resolveLanguagePreference(null,'ja',['de-DE']),'ja');assert.equal(resolveLanguagePreference(null,null,['de-DE']),'de');
 assert.equal(resolveLanguagePreference('__proto__','constructor',['ko-KR']),'ko');assert.equal(resolveLanguagePreference(null,'__proto__',[]),'en');
});
