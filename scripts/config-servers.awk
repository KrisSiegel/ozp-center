#!/usr/bin/awk -f

BEGIN {
    clientIndent = "            "
    printed = "false"
}

/client: *{/ {
    print $0
    if (SVC_URL != "") {
        printf("%sservicesHost: \"%s\",\n", clientIndent, SVC_URL);
    }
    if (STATIC_URL != "") {
        printf("%sstaticHost: \"%s\",\n", clientIndent, STATIC_URL);
    }
    printed = "true"
}

printed == "false" { print }

{ printed = "false" }
