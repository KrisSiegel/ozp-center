#!/usr/bin/awk -f

BEGIN {
    clientIndent = "            "
    printed = "false"
}

/deployedTiers/ {
    print;
    printf("%s    \"client\"\n", clientIndent);
    while ($0 !~ /]/) {
	getline
    }
}

/{ module:/ {
    if ($3 ~ /"ozone-api"|"ozone-services-client-configuration"/) {
	print $0
    }
    printed = "true"
}

printed == "false" { print }

{ printed = "false" }
