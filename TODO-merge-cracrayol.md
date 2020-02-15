* https://github.com/tonib/kaichronicles/commit/77f6a57aefb41f847fd34e5caa3efef1d82b9369
    - Check "eludeEnemyEP" seems OK, check it in book 13
    - Re-Check all Kai Surge stuff
        * combatMechanics.ts: check "// TODO: What is this for ???" comments
    - Recheck all this commit when book 13 is playable

* https://github.com/tonib/kaichronicles/commit/f31306ad54317ad7809bc69a864ae1fa13ea2b57
    
* https://github.com/tonib/kaichronicles/commit/3b89b305636c1603cac2df431856d86ea46e7961
    - "Replace Google analytics with Matomo" Why?
    - package.json: Added devDependencies for bootstrap, cordova, jquery and toastr... TODO (for me): Check how Typescript compiler
      and VS Code finds declarations for JQuery, and toastr (and others). CHECK VERSIONS MATCH!
    - Check Android app (promises changes)

* https://github.com/tonib/kaichronicles/commit/c43942a7b8e0ccc29751243818b9cbbefb4e5bbd

* https://github.com/tonib/kaichronicles/commit/6a8fced2fa52641e06ddaac1010811d6c0895945

* https://github.com/tonib/kaichronicles/commit/3db83f64a160c37e7d34ee53542ca093692c7fc8
    - Hide "Lore-circles" text from Action Chart ??? NO, SHOW THEM
    - "equipmnt" section: /* TODO Drop special items */
    - Check disciplines descriptions in Action Chart. Add disciplines images ???

* https://github.com/tonib/kaichronicles/commit/92026b396efe8661d356de79c897107af7f6dc70

* https://github.com/tonib/kaichronicles/commit/eed867198d60c99b54c3640976762125e8ee91e7

* https://github.com/tonib/kaichronicles/commit/c527e2e63ae80c6a5e60ef66cde29f3825ee2725
    - Change reverted (commented). It will break things

* https://github.com/tonib/kaichronicles/commit/178ede7fd36f709134b596d983dea7160ea2fcb4

* https://github.com/tonib/kaichronicles/commit/b66fb49cdf956f497a8b35b233fffcc9b6fd4465
    - Re-Check all Kai Surge stuff
    
* https://github.com/tonib/kaichronicles/commit/5e9d84bc5f9ad18052e9b8d3b23b23d262ea697e
    - TODO (mine): If an object has no spanish translation, show the english name
    - Restore persisted state of usages in ActionChart
    - Keep compatibility with old objects with no usages count

* https://github.com/tonib/kaichronicles/commit/38d0d6700c6297ae411f764b91e693e1497f93bd

* https://github.com/tonib/kaichronicles/commit/4ff3ec7b4d13e57fd97212f84d64de37b0b99a2a
    
* https://github.com/tonib/kaichronicles/commit/2c735813f81289a264a9311f90be76ebfb1a67ea

* https://github.com/tonib/kaichronicles/commit/d89bbb8b0d8fbb53ae07f4344216369f3129d5ed

* https://github.com/tonib/kaichronicles/commit/1900c726f5c8e65bbfbda97b4d2c9d12985b36d4

* https://github.com/tonib/kaichronicles/commit/45eb52b827f6d0b3038091de9ee97eb847b8037b
    - Update README: npm install will require npm version >= 5.0 to use package-lock.json
    - Typescript compilation: Changed es5 to es3
    
* https://github.com/tonib/kaichronicles/commit/a7f98eb2832e4db499b169991eeb76a3004e3df1

* https://github.com/tonib/kaichronicles/commit/4d15ca61dd6c4a07b4e8708c1ff0abc7651346bd

* https://github.com/tonib/kaichronicles/commit/4b05bff00065aa5c3b75486915803bd4ba1e056b
    - Missed some changes for src/www/js/ts-generated -> src/www/js (added in later commits)

* https://github.com/tonib/kaichronicles/commit/e0f38a73a81b847d7762937bf423f7e74dbbdd14


* https://github.com/tonib/kaichronicles/commit/de660e6725339cd12cd8f4b7e2b23162a809581e
    - Add info in README.md about use TSLint
    - TODO (mine): Re-indent common.ts (4 spaces)
    - Renomve jshint ignore comments (no longer used)
    - Restore commented throws in root files ????

* https://github.com/tonib/kaichronicles/commit/dc8ff394b48e322ec58c0fd347738c4061c6a57b
    - I needed sudo to install serve with -g

* https://github.com/tonib/kaichronicles/commit/9f3fe419514c4b82952661f75e0c10c336a11684
    - Reverted the final fail handler for game setup

* https://github.com/tonib/kaichronicles/commit/5f83d745b84c65dbe940510dbe334fb132db5233
    
* https://github.com/tonib/kaichronicles/commit/09d312465261e04f6871506e18dcce531cab1ea6
    - Re-add double quotes in translations.ts (lost in merge)
    - ObjectsTableItem has been moved to new file. Check changes
    - REVERTED
    - CHECK ALL "throw new Error", probably they will need to be removed
    - Keeped controllers as "class". Useful to have private members
    - I simply cannot check this: loadGameController.ts


* TSLINT:
    - CURRENT CHECK: combatTurn.ts
    - TSLint is deprecated...
    - REMOVE src/ts/test-tslist.ts (TSLint tests)
    - "only-arrow-functions" fix can break things. Semantics are different (this behaviour). There are a lot, ignore rule
    - "prefer-const" fix can break things. (var scope). Keeped as rule
    - "no-var-keyword" fix can break things. (var scope). Keeped as rule
    - "triple-equals" can break things. Keeped as rule
    - Ask why so many whitespaces were removed in commit 09d312465261e04f6871506e18dcce531cab1ea6

* Book 12 (Spanish):
    sect350: This book is different from previous. You have to click on a footer note link to continue to the next book...
    Ugly. Add a message rule to help?

* Book 13 tests:
    - Up to sect1
    - Remove showCount property from mechanics-13+
    - "Game rules section": There is a link to the "Readers’ Handbook": Read this!
    - Big TODO: Added "dropDisciplines" to "tssf" section. Needed because you don't carry previous Magnakai displiclines.
      But you should keep your "Lore circles" and other bonuses... So, we should keep a track of old previous book series
      disciplines.... Or, assume that if you have moved to a new serie from a previous one, you have all the old serie 
      disciplines

* Book 14+:
    - Add rule "restoreDeliveranceUse" on each book "tssf" section

* Spanish books erratas:
    - Book 13, sect equipmnt: "tu nueva Carta de Acciónde Gran Maestro" should be "tu nueva Carta de Acción de Gran Maestro" (space)
    - Book 13, sect1: 
        * '" Me gustaría poder"' should be "Me gustaría poder" (space)
        * 'en tu misión.”dice Rimoah' should be 'en tu misión,” dice Rimoah' (comma, and space)