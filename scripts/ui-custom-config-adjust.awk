#!/usr/bin/awk -f

BEGIN {
    clientIndent = "            "
    printed = "false"
}

/client: *{/ {
    print $0
    if (PORT != "") {
	printf("%sport: %s,\n", clientIndent, PORT);
    }
    if (SVC_URL != "") {
        printf("%sservicesHost: \"%s\",\n", clientIndent, SVC_URL);
    }
    if (STATIC_URL != "") {
        printf("%sstaticHost: \"%s\",\n", clientIndent, STATIC_URL);
    }
    printed = "true"
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
