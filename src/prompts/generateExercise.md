<!-- v1 -->
Task: create a new "contradiction hunter" exercise for topic "{{topic}}", difficulty {{level}}/3. Learner's weak rules (most violated first): {{weak}}.
Make 6 short English prompt sentences about light, camera or characters, each with its Turkish meaning. 3 or 4 of them contain exactly one contradiction (e.g. ceiling lamp lighting from below, candle with blue light, soft light with razor-sharp shadows, POV showing the viewer's own face, over-the-shoulder with only one character). The rest are correct.
Return JSON: {"titleTr": string, "items": [{"text": string, "tr": string, "bad": boolean, "whyTr": string}]}
