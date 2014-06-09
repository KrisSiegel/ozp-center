#!/bin/bash

BIG_CSS_FILE=hud-components.css
BIG_JS_FILE=hud-components.js
BIG_HTML_FILE=hud-components.html

rm $BIG_CSS_FILE $BIG_JS_FILE $BIG_HTML_FILE
echo '<script type="text/javascript" src="'$BIG_JS_FILE'"></script>
<link rel="stylesheet" href="'$BIG_CSS_FILE'">' > $BIG_HTML_FILE

COMPONENTS="bar mask app apps apps-grid apps-appinfo collection chat notifications"
#COMPONENTS=$(cd components; ls |grep -v '\.')

echo \$COMPONENTS IS $COMPONENTS
for c in $COMPONENTS
do
    base=components/ozone-$c/ozone-$c

    # CSS
    echo "/* $base.css */" >> $BIG_CSS_FILE
    cat $base.css >> $BIG_CSS_FILE
    echo >> $BIG_CSS_FILE

    # JS
    echo "// $base.js " >> $BIG_JS_FILE
    cat $base.js >> $BIG_JS_FILE
    echo >> $BIG_JS_FILE

    # HTML
    tpl_id=$(echo $base.html | sed 's,.*/\([^/]*\).html,\1,')
    echo "<template class=\"${tpl_id}-tpl\">" >> $BIG_HTML_FILE
    cat $base.html >> $BIG_HTML_FILE

    #This way cuts out most of the debug noise from not finding files
    #with wrong paths
    #tail -n +2 $base.html >> $BIG_HTML_FILE
    echo "</template>" >> $BIG_HTML_FILE
done
