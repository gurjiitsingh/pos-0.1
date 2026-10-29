const { db } = require('./sqlite.cjs');

function getBusinessDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Get the currently OPEN business day.
 *
 * There must be only one OPEN business day.
 */
function getCurrentBusinessDay() {
  const current = db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE status = 'OPEN'
      ORDER BY businessDate DESC
      LIMIT 1
    `)
    .get();

  if (current) {
    return current;
  }

  // No open business day found.
  // Automatically create today's business day.
  const now = Date.now();

  const today = new Date();

  const businessDate =
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const existing = db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(businessDate);

  if (existing) {
    return existing;
  }

  const id = businessDate;

  db.prepare(`
    INSERT INTO pos_business_day (
      id,
      businessDate,
      openedAt,
      openedById,
      openedByName,
      openingCash,
      isClosed,
      status,
      updatedAt
    )
    VALUES (
      @id,
      @businessDate,
      @openedAt,
      @openedById,
      @openedByName,
      @openingCash,
      0,
      'OPEN',
      @updatedAt
    )
  `).run({
    id,
    businessDate,
    openedAt: now,
    openedById: '',
    openedByName: '',
    openingCash: 0,
    updatedAt: now,
  });

  return db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE id = ?
      LIMIT 1
    `)
    .get(id);
}

/**
 * Get a specific business day by business date.
 *
 * Example:
 * getBusinessDayByDate('2026-10-07')
 */
function getBusinessDayByDate(businessDate) {
  if (!businessDate) {
    return undefined;
  }

  return db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(businessDate);
}

/**
 * Get current business date.
 */
function getBusinessDateCurrent() {
  const businessDay = getCurrentBusinessDay();

  if (!businessDay) {
    return null;
  }

  return businessDay.businessDate;
}

/**
 * Close the currently OPEN business day.
 */
function closeCurrentBusinessDay(
  closedById,
  closedByName
) {
  const current = getCurrentBusinessDay();

  if (!current) {
    throw new Error(
      'No open business day found.'
    );
  }

  const now = Date.now();

  db
    .prepare(`
      UPDATE pos_business_day
      SET
        isClosed = 1,
        status = 'CLOSED',
        closedAt = @closedAt,
        closedById = @closedById,
        closedByName = @closedByName,
        updatedAt = @updatedAt
      WHERE id = @id
    `)
    .run({
      id: current.id,
      closedAt: now,
      closedById: closedById || '',
      closedByName: closedByName || '',
      updatedAt: now,
    });

  return getBusinessDayByDate(
    current.businessDate
  );
}

/**
 * Check whether another business day can be created.
 */
function canCreateNextBusinessDay() {
  const current = getCurrentBusinessDay();

  if (!current) {
    return true;
  }

  const today = getBusinessDate();

  return current.businessDate <= today;
}

/**
 * Create the next business day.
 *
 * Every business day gets its own permanent row.
 *
 * Example:
 * id = '2026-10-07'
 * id = '2026-10-08'
 * id = '2026-10-09'
 */
function createNextBusinessDay({
  openingCash = 0,
  openedById = '',
  openedByName = '',
}) {
  const current = getCurrentBusinessDay();
  const today = getBusinessDate();

  if (current && current.businessDate > today) {
    return {
      success: true,
      alreadyPrepared: true,
      businessDate: current.businessDate,
      message:
        'Business day is already prepared for the next day.',
    };
  }

  let nextDate;

  if (!current) {
    nextDate = today;
  } else if (current.businessDate === today) {
    const date = new Date();

    date.setDate(
      date.getDate() + 1
    );

    nextDate = getBusinessDate(date);
  } else {
    nextDate = today;
  }

  const existing = getBusinessDayByDate(
    nextDate
  );

  if (existing) {
    return existing;
  }

  const now = Date.now();

  db
    .prepare(`
      INSERT INTO pos_business_day (
        id,
        businessDate,
        openedAt,
        openedById,
        openedByName,
        openingCash,
        isClosed,
        closedAt,
        closedById,
        closedByName,
        status,
        updatedAt
      )
      VALUES (
        @id,
        @businessDate,
        @openedAt,
        @openedById,
        @openedByName,
        @openingCash,
        0,
        NULL,
        NULL,
        NULL,
        'OPEN',
        @updatedAt
      )
    `)
    .run({
      id: nextDate,
      businessDate: nextDate,
      openedAt: now,
      openedById: openedById || '',
      openedByName: openedByName || '',
      openingCash:
        Number(openingCash) || 0,
      updatedAt: now,
    });

  return getBusinessDayByDate(
    nextDate
  );
}

/**
 * Update opening cash of current OPEN business day.
 */
function updateOpeningCash(openingCash) {
  const current = getCurrentBusinessDay();

  if (!current) {
    throw new Error(
      'No open business day found.'
    );
  }

  db
    .prepare(`
      UPDATE pos_business_day
      SET
        openingCash = @openingCash,
        updatedAt = @updatedAt
      WHERE id = @id
    `)
    .run({
      id: current.id,
      openingCash:
        Number(openingCash) || 0,
      updatedAt: Date.now(),
    });

  return getBusinessDayByDate(
    current.businessDate
  );
}

/**
 * Update opened-by information of current
 * OPEN business day.
 */
function updateOpenedBy(
  openedById,
  openedByName
) {
  const current = getCurrentBusinessDay();

  if (!current) {
    throw new Error(
      'No open business day found.'
    );
  }

  db
    .prepare(`
      UPDATE pos_business_day
      SET
        openedById = @openedById,
        openedByName = @openedByName,
        updatedAt = @updatedAt
      WHERE id = @id
    `)
    .run({
      id: current.id,
      openedById: openedById || '',
      openedByName: openedByName || '',
      updatedAt: Date.now(),
    });

  return getBusinessDayByDate(
    current.businessDate
  );
}

module.exports = {
  getCurrentBusinessDay,
  getBusinessDayByDate,
  getBusinessDate: getBusinessDateCurrent,
  closeCurrentBusinessDay,
  canCreateNextBusinessDay,
  createNextBusinessDay,
  updateOpeningCash,
  updateOpenedBy,
};