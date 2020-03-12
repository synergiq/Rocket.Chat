# Rocket.Chat.Enterprise

Repository for packages to be included only on Enterprise edition.

## List of features

Below is a table with all features provided by the Enterprise version:

Feature | Description | Code | Bundle
------------ | ------------- | ------------- | -------------
Auditing | Provides admin pages for auditing messages from direct messages and private groups | `auditing` | Enterprise
Canned Responses | Add support for pre-configured responses | `canned-responses` | Enterprise
LDAP Groups | Add support to set a Rocket.Chat role for a user based on its LDAP role | `ldap-enterprise` | Enterprise
Livechat Enterprise | Enables many new functionalities for livechat | `livechat-enterprise` | Enterprise

## Release cycle

Enterprise releases follows Rocket.Chat release schedule, but usually it doesn't have a release candidate period.

A new Enterprise version is released at the same day as the final Rocket.Chat release is.

The Enterprise version is composed by `RocketChatVersion-EnterpriseVersion`, i.e.: `2.1.0-1` which means it is the second Enterprise version (starts at `0`) and is based on Rocket.Chat version `2.1.0`.

Additional Enterprise versions can be released without a schedule.

### Cutting a release

* First set the target Rocket.Chat version on [.circleci/config.yml](https://github.com/RocketChat/Rocket.Chat.Enterprise/blob/master/.circleci/config.yml#L4) file:
`ROCKETCHAT_VERSION: "2.1.0"`
* Then after [CircleCI build](https://circleci.com/gh/RocketChat/Rocket.Chat.Enterprise) finishes successfully, create a new [GitHub Release](https://github.com/RocketChat/Rocket.Chat.Enterprise/releases/new)
  * 'Tag version' will follow Enterprise release convention, i.e.: `2.1.0-0`
  * 'Release title' can be the same as 'Tag version'
