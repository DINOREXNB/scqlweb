let ori={
    "parties": [
        {
            "party_code": "bob",
            "public_key": "MCowBQYDK2VwAyEAUMKYLUx7QTFwXjkzmEzYvtyKQY3INhSDbIM5Pss/AIU="
        },
        {
            "party_code": "alice",
            "public_key": "MCowBQYDK2VwAyEACrNhc6ARtonT0saU5hvbRp1JInpUkEFd25dfVRK3qGk="
        }
    ]
};
let newdata={
    party_code: 'dinorex',
    public_key: 'MCowBQYDK2VwAyEAIjU+qTl4Z9eOCTM4tYw/ytOC/00b8w1cuhbGdR1hvnI='
}
console.log(ori.parties);
ori.parties.push(newdata);
console.log(ori);