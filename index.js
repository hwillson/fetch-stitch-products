const { request } = require('https');

const StitchProductFetcher = (() => {
  const pub = {};
  const priv = {};

  /* Public API */

  pub.init = (clientSecret) => {
    priv.verifyClientSecret(clientSecret);
    priv.clientSecret = clientSecret;
  };

  pub.fetchProducts = async (mockStitchResponses = []) => {
    priv.verifyClientSecret();

    const data = {
      action: 'read',
      page_size: 50,
    };
    const options = { ...priv.defaultOptions() };

    let products = [];
    let currentPage = 0;
    let lastPage = 1;
    do {
      const mockStitchResponse = mockStitchResponses.length
        ? mockStitchResponses[currentPage]
        : null;
      currentPage += 1;
      data.page_num = currentPage;
      let response;
      try {
        response = await priv.postData(
          options,
          JSON.stringify(data),
          mockStitchResponse,
        );
        console.log(`Fetched ${data.page_size * currentPage} products.`);
      } catch (error) {
        console.log(error);
      }
      products = products.concat(priv.extractProductsFromResponse(response));

      const { meta } = response;
      lastPage = +meta.last_page;
    } while (currentPage < lastPage);

    return products;
  };

  /* Private API */

  priv.clientSecret = null;

  priv.defaultOptions = () => ({
    hostname: 'api-pub.stitchlabs.com',
    path: '/api2/v2/Variants',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      access_token: priv.clientSecret,
    },
  });

  priv.verifyClientSecret = (clientSecret) => {
    if (!(clientSecret || priv.clientSecret)) {
      throw new Error('Missing StitchLabs developer API client secret');
    }
  };

  priv.postData = (options, data, mockStitchResponse = null) => (
    new Promise((resolve, reject) => {
      if (mockStitchResponse) {
        resolve(mockStitchResponse);
      }

      const req = request(options, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error(`Uh oh! Status code: ${res.statusCode}`));
        }

        let body = [];
        res.on('data', chunk => body.push(chunk));

        res.on('end', () => {
          try {
            body = JSON.parse(Buffer.concat(body).toString());
          } catch (error) {
            reject(error);
          }
          resolve(body);
        });
      });

      req.on('error', err => reject(err));

      if (data) {
        req.write(data);
      }

      req.end();
    })
  );

  priv.extractProductsFromResponse = (response) => {
    let products = [];
    if (response && response.Variants) {
      products = response.Variants.map(variant => ({
        productId: variant.links.Products[0].id,
        variantId: variant.id,
        description: variant.auto_description_with_option_type,
        upc: variant.upc,
        sku: variant.sku,
        totalStock: +variant.stock,
        committedStock: +variant.committed_stock,
        availableStock: +variant.available,
        totalSold: +variant.total_sold,
        averageCost: +variant.average_cost,
      }));
    }
    return products;
  };

  /* Reveal */
  return pub;
})();

module.exports = StitchProductFetcher;
