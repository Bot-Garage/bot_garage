// +-----------------------------------------------------------+
// |   Form - Add Hint Element                                 |
// |                                                           |
// |   This will add a hint to any form that doesnt have one   |
// +-----------------------------------------------------------+
$("form:not(:has(.hint))").prepend("<div class=\"hint hidden\"></div>");