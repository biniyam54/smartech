const advancedResult = (model) => async (req, res, next) => {
  // copy query
  const reqQuery = { ...req.query };

  //   remove fields from query
  const removeFields = ["select", "limit", "sort", "page"];
  removeFields.forEach((params) => delete reqQuery[params]);

  //   stringify to change op > $op
  let queryStr = JSON.stringify(reqQuery);
  queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // finding resource
  let query = model.find(JSON.parse(queryStr));

  //   select field
  if (req.query.select) {
    const select = req.query.select.split(",").join(" ");
    query = query.select(select);
  }

  //   sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //   pagination
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;
  const count = await model.countDocuments(JSON.parse(queryStr));
  const pages = Math.ceil(count / limit);

  query = query.skip(skip).limit(limit);

  //   const results = await query;

  res.result = {
    query,
    pages,
    page,
    count,
  };

  next();
};

module.exports = advancedResult;
