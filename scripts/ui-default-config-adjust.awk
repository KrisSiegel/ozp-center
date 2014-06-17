#!/usr/bin/awk -f

BEGIN {
    clientIndent = "                    "
    printed = "false"
}

/{ module:/ {
    if ($3 ~ /"ozone-api"|"ozone-services-client-configuration"/) {
	print $0
    }
    printed = "true"
}

printed == "false" { print }

{ printed = "false" }
