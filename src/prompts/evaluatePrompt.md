<!-- v1 -->
Task: evaluate the learner's prompt against the rubric. The deterministic rubric already found:
{{rubric}}

Learner's prompt:
"""
{{text}}
"""

Lesson goal (Turkish): {{goal}}

Return JSON: {"reasonsTr": string[] (max 4 short Turkish sentences, warm and specific), "suggestionEn": string (an improved English prompt in 5 boxes ending with the texture line), "suggestionTr": string (its Turkish meaning)}
