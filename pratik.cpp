#include <bits/stdc++.h>
using namespace std;

bool isIsomorphic(string s, string t) {
    if (s.length() != t.length()) return false;

    unordered_map<char, char> mapST;
    unordered_map<char, char> mapTS;

    for (int i = 0; i < s.length(); i++) {
        char c1 = s[i];
        char c2 = t[i];

        if (mapST.count(c1) && mapST[c1] != c2)
            return false;

        if (mapTS.count(c2) && mapTS[c2] != c1)
            return false;

        mapST[c1] = c2;
        mapTS[c2] = c1;
    }
    return true;
}

int main() {
    cout << isIsomorphic("egg", "add") << endl;     // 1 (true)
    cout << isIsomorphic("foo", "bar") << endl;     // 0 (false)
    cout << isIsomorphic("paper", "title") << endl; // 1 (true)
}


#include <bits/stdc++.h>
using namespace std;

bool wordPattern(string pattern, string s) {
    vector<string> words;
    string word;
    stringstream ss(s);

    while (ss >> word) {
        words.push_back(word);
    }

    if (pattern.length() != words.size())
        return false;

    unordered_map<char, string> mapPS;
    unordered_map<string, char> mapSP;

    for (int i = 0; i < pattern.length(); i++) {
        char ch = pattern[i];
        string w = words[i];

        if (mapPS.count(ch) && mapPS[ch] != w)
            return false;

        if (mapSP.count(w) && mapSP[w] != ch)
            return false;

        mapPS[ch] = w;
        mapSP[w] = ch;
    }
    return true;
}

int main() {
    cout << wordPattern("abba", "dog cat cat dog") << endl;   // 1
    cout << wordPattern("abba", "dog cat cat fish") << endl; // 0
