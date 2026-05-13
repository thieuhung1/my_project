import React from 'react';

const HeaderSearch = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  handleSearch,
  getProductImage,
  closeNavbar,
}) => {
  return (
    <div className="position-relative me-lg-3 my-2 my-lg-0 header-search-wrap">
      <form className="d-flex" role="search" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
        <div className="input-group header-search shadow-sm">
          <span className="input-group-text bg-white border-0 text-muted">
            <i className="bi bi-search" />
          </span>
          <input
            className="form-control border-0"
            type="search"
            placeholder="Tìm món ăn..."
            aria-label="Search"
            aria-autocomplete="list"
            aria-expanded={searchResults.length > 0}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setSearchQuery((value) => value)}
            style={{ minWidth: 0 }}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-light border-0"
              onClick={() => setSearchQuery('')}
              aria-label="Xóa từ khóa"
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
          <button className="btn btn-warning text-white fw-semibold px-3" type="submit">Tìm</button>
        </div>
      </form>

      {searchQuery.trim() && searchResults.length > 0 && (
        <div className="header-search-dropdown">
          <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
            <small className="text-muted fw-semibold">Gợi ý gần đúng</small>
            <button
              type="button"
              className="btn btn-link btn-sm text-decoration-none p-0"
              onClick={() => setSearchQuery('')}
            >
              Xóa
            </button>
          </div>
          <div className="header-search-results">
            {searchResults.map((product) => (
              <button
                key={product.id}
                type="button"
                className="header-search-item"
                onClick={() => handleSearch(product.name)}
              >
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="header-search-image"
                  onError={(e) => {
                    e.currentTarget.src = '/ASSETS/Images/placeholder.jpg';
                  }}
                />
                <div className="header-search-info">
                  <div className="fw-semibold text-truncate">{product.name}</div>
                  <div className="small text-muted text-truncate">{product.category || 'Món ăn'}</div>
                </div>
                <div className="header-search-price">
                  <div className="fw-bold" style={{ color: 'var(--primary-orange)' }}>
                    {Number(product.price || 0).toLocaleString('vi-VN')}₫
                  </div>
                  <small className="text-muted">Xem chi tiết</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
