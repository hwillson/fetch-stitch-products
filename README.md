# fetch-stitch-products

Fetch a list of products from [http://stitchlabs.com](http://stitchlabs.com).

# Overview

Fetch a list of products using StitchLab's developer API. By default the
Stitch API returns quite a few products details, so this utility greatly
reduces the returned product information. The intent of this utility is to
make it easier to extract quick product synopsis data from Stitch (like
which products are being tracked, what their current inventory is,
cost details, etc.), that can then be passed to, and consumed by, other
services.

## Prerequisites

1. You must be an existing [https://www.stitchlabs.com](http://stitchlabs.com)
   customer, and have a Stitch developer account. You can request developer
   access through their support team.
2. Once you have a developer account, login to their
   [https://developer.stitchlabs.com](https://developer.stitchlabs.com) admin
   panel, and create a new `Application`. Note down your `Client Secret`.

## Installation

`npm install --save fetch-stitch-products`

## Usage

```
const StitchProductFetcher = require('fetch-stitch-products');
const fetcher = Object.create(StitchProductFetcher);
fetcher.init('your-stitch-client-secret');
fetcher.fetchProducts().then((products) => {
  // All loaded products are now in the `products` array.
});
```
