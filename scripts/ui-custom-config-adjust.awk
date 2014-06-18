#!/usr/bin/awk -f

BEGIN {
    clientIndent = "            "
    printed = "false"
}

/absoluteBaseUrl/ && BASE {
    printf("%s%s \"%s\",\n", clientIndent, $1, BASE);
    printed = "true"
}

/client: *{/ {
    print $0
    if (PORT != "") {
	printf("%sport: %s,\n", clientIndent, PORT);
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

printed == "false" { print }

{ printed = "false" }
