import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { getReviewsByProduct, addReply, addReview, hasUserReviewed } from '../../features/controllers/reviewService';

const fmt = n => n?.toLocaleString('vi-VN') + 'đ';

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { user, userProfile, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const product = useMemo(() => products.find(p => String(p.id) === String(id)), [products, id]);
  const related = useMemo(() => products.filter(p => p.category === product?.category && p.id!== product?.id).slice(0,4), [products, product]);

  const [qty, setQty] = useState(1);
  const [favLoading, setFavLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingRev, setLoadingRev] = useState(true);
  const [replying, setReplying] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [toast, setToast] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoadingRev(true);
      const data = await getReviewsByProduct(id);
      setReviews(data);
      if (user?.uid) setHasReviewed(await hasUserReviewed(id, user.uid));
      setLoadingRev(false);
    })();
  }, [id, user]);

  useEffect(() => { if (toast) { const t = setTimeout(()=>setToast(''), 3000); return ()=>clearTimeout(t); } }, [toast]);

  if (!product) return <div className="container my-5 text-center pt-5"><h3>Không tìm thấy món</h3><Link to="/products" className="btn btn-warning mt-3 text-white rounded-pill">Quay lại</Link></div>;

  const isFav = userProfile?.favorites?.includes(product.id);
  const avg = reviews.length? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : product.rating?.toFixed(1) || '5.0';
  const total = reviews.length;
  const current = reviews.slice((page-1)*perPage, page*perPage);

  const handleCart = () => {
    if (!addToCart(product, qty)) return navigate('/login');
    setToast(`Đã thêm ${qty} ${product.name}`);
  };
  const buyNow = () => { if (!addToCart(product, qty)) return navigate('/login'); navigate('/cart'); };
  const toggleFav = async () => { setFavLoading(true); try { await toggleFavorite(product.id); } catch(e){ if(e.message.includes('đăng')) navigate('/signin'); } finally { setFavLoading(false); } };

  const submitReview = async () => {
    if (!comment.trim()) return setToast('Nhập nội dung nhé');
    const newRev = { id:'temp', productId:id, userId:user.uid, userName:userProfile?.displayName||'Bạn', rating, comment, createdAt:{toDate:()=>new Date()}, replies:[] };
    setReviews(r=>[newRev,...r]); setComment(''); setHasReviewed(true);
    try { await addReview({...newRev, replies:[] }); const data = await getReviewsByProduct(id); setReviews(data); setToast('Cảm ơn đánh giá!'); }
    catch { setToast('Lỗi gửi'); }
  };
  const submitReply = async (rid) => {
    if (!replyText.trim()) return;
    await addReply(rid, { userName:userProfile?.displayName||'Bạn', userId:user.uid, content:replyText });
    setReplying(null); setReplyText(''); setReviews(await getReviewsByProduct(id));
  };

  return (
    <div className="container my-5 fade-in-up">
      {toast && <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow-sm" style={{zIndex:1050, borderRadius:12}}>{toast}</div>}

      <nav aria-label="breadcrumb" className="mt-5 pt-3">
        <ol className="breadcrumb" style={{background:'var(--light-orange)'}}>
          <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
          <li className="breadcrumb-item"><Link to="/products">Món ngon</Link></li>
          <li className="breadcrumb-item active">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-5">
        <div className="col-lg-6">
          <div className="position-relative overflow-hidden rounded-4 shadow-sm">
            <img src={product.imageUrl||product.image} alt={product.name} className="w-100 blur-up" style={{height:500, objectFit:'cover', transition:'transform.4s'}} onLoad={e=>e.currentTarget.classList.add('loaded')} onMouseOver={e=>e.currentTarget.style.transform='scale(1.05)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'} onError={e=>e.currentTarget.src='/ASSETS/Images/placeholder.jpg'}/>
            <button onClick={toggleFav} disabled={favLoading} className="btn rounded-circle position-absolute shadow-sm" style={{top:15,right:15,width:44,height:44,background:'white'}} title="Yêu thích">
              {favLoading? <span className="spinner-border spinner-border-sm"/> : <i className={`bi ${isFav?'bi-heart-fill':'bi-heart'}`} style={{color:'var(--primary-orange)', fontSize:20}}/>}
            </button>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="p-4 border-0 rounded-4 shadow-sm bg-white" style={{borderRadius:'var(--border-radius)'}}>
            <h1 className="fw-bold mb-2 text-gradient-orange" style={{fontFamily:'Roboto Condensed, sans-serif'}}>{product.name}</h1>
            <div className="d-flex gap-2 mb-3">
              <span className="badge badge-gradient">Hot</span>
              <span className="badge bg-success">Freeship Vinh</span>
            </div>
            <div className="display-6 fw-bold mb-1" style={{color:'var(--primary-orange)'}}>{fmt(product.price)}</div>
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="text-warning">{[...Array(5)].map((_,i)=><i key={i} className={`bi bi-star${i<Math.round(avg)?'-fill':''}`}/>)}</div>
              <span className="fw-semibold">{avg}</span><span className="text-muted">({total} đánh giá)</span>
            </div>

            <div className="mb-4" style={{maxWidth:200}}>
              <label className="fw-semibold">Số lượng</label>
              <div className="input-group">
                <button className="btn btn-outline-secondary" onClick={()=>setQty(q=>Math.max(1,q-1))}>-</button>
                <input type="number" className="form-control text-center" value={qty} min="1" onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))}/>
                <button className="btn btn-outline-secondary" onClick={()=>setQty(q=>q+1)}>+</button>
              </div>
            </div>

            <div className="d-grid gap-2 d-md-flex mb-4">
              <button className="btn btn-success btn-lg px-4 rounded-pill btn-ripple" onClick={handleCart}><i className="bi bi-cart-plus me-2"/>Thêm giỏ</button>
              <button className="btn btn-warning text-white btn-lg px-4 rounded-pill shadow-orange btn-ripple" onClick={buyNow}><i className="bi bi-lightning-charge me-2"/>Mua ngay</button>
            </div>

            <ul className="list-unstyled small">
              <li className="mb-1"><i className="bi bi-clock text-warning me-2"/>Giao 30 phút nội thành Vinh</li>
              <li className="mb-1"><i className="bi bi-fire text-danger me-2"/>Làm nóng tại bếp</li>
            </ul>

            <hr/>
            <h6 className="fw-bold mb-3">Đánh giá</h6>
            {user? (!hasReviewed? (
              <div className="bg-light p-3 rounded-3 mb-3">
                <div className="mb-2">{[1,2,3,4,5].map(s=><i key={s} className={`bi bi-star${s<=rating?'-fill':''} text-warning me-1`} style={{cursor:'pointer', fontSize:20}} onClick={()=>setRating(s)}/>)}</div>
                <textarea className="form-control mb-2" rows="2" placeholder="Chia sẻ cảm nhận..." value={comment} onChange={e=>setComment(e.target.value)} style={{borderRadius:12}}/>
                <button className="btn btn-warning btn-sm text-white rounded-pill" onClick={submitReview}>Gửi</button>
              </div>
            ) : <div className="alert alert-success py-2">Bạn đã đánh giá. Cảm ơn!</div>) : <div className="alert alert-light">Đăng nhập để đánh giá</div>}

            {loadingRev? [...Array(3)].map((_,i)=><div key={i} className="shimmer mb-3" style={{height:60, borderRadius:12}}/>)
              : current.map(r=>(
              <div key={r.id} className="border-bottom pb-2 mb-2">
                <div className="d-flex justify-content-between"><strong className="small">{r.userName}</strong><span className="text-warning small">{'★'.repeat(r.rating)}</span></div>
                <p className="small mb-1">{r.comment}</p>
                <small className="text-muted">{r.createdAt?.toDate?.().toLocaleDateString('vi-VN')}</small>
                {r.replies?.map((rp,i)=><div key={i} className="ms-3 ps-2 border-start mt-2"><strong className="small text-success">{rp.userName}</strong><p className="small mb-0">{rp.content}</p></div>)}
                {user && <button className="btn btn-link btn-sm p-0" onClick={()=>setReplying(r.id)}>Trả lời</button>}
                {replying===r.id && <div className="input-group input-group-sm mt-1"><input className="form-control" value={replyText} onChange={e=>setReplyText(e.target.value)}/><button className="btn btn-success btn-sm" onClick={()=>submitReply(r.id)}>Gửi</button></div>}
              </div>
            ))}
            {total>perPage && <nav><ul className="pagination pagination-sm justify-content-center">{[...Array(Math.ceil(total/perPage))].map((_,i)=><li key={i} className={`page-item ${page===i+1?'active':''}`}><button className="page-link" onClick={()=>setPage(i+1)}>{i+1}</button></li>)}</ul></nav>}
          </div>
        </div>
      </div>

      {related.length>0 && <>
        <h4 className="fw-bold mt-5 mb-3">Món tương tự</h4>
        <div className="row">{related.map(p=>(
          <div key={p.id} className="col-6 col-md-3 mb-3">
            <Link to={`/product/${p.id}`} className="text-decoration-none text-dark">
              <div className="card border-0 shadow-sm h-100">
                <img src={p.imageUrl||p.image} className="card-img-top" style={{height:160,objectFit:'cover'}} alt={p.name}/>
                <div className="card-body p-2"><div className="small fw-semibold text-truncate">{p.name}</div><div style={{color:'var(--primary-orange)'}} className="fw-bold small">{fmt(p.price)}</div></div>
              </div>
            </Link>
          </div>
        ))}</div>
      </>}
    </div>
  );
}