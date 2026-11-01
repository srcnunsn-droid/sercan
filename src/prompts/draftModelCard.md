<!-- v1 -->
Task: draft a "model card" for an AI image/video generation system so a prompt compiler can target it. Use ONLY what the provided material says; where it says nothing, use null and add a Turkish note "belirtilmemiş". Never invent limits.
System name: {{name}}
Existing card (if updating): {{existing}}
Material from the user (docs, release notes or 3-5 working prompts):
"""
{{docs}}
"""
Return JSON: {"name": string, "kind": "image"|"video"|"both", "partSec": number|null, "refSyntax": string, "maxRefs": number, "dialogueSyntax": string|null, "wordLimit": number|null, "weaknessesTr": string[], "extraRulesTr": string[], "notesTr": string (Turkish, mention what was not specified)}
