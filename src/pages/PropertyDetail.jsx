<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
class Property extends Model
{
    protected $fillable = [
        'user_id','location_id','title','slug','type','description',
        'price','price_type','area','area_unit','bedrooms','bathrooms',
        'approval_type','facing','amenities','nearby','youtube_url',
        'latitude','longitude','whatsapp_contact','status',
        'is_featured','is_verified','rank_score','views','leads_count',
        'listed_at','expires_at','rejection_reason',
        'sold_at','sold_in_days','contacts_count',
    ];
    protected $casts = [
        'amenities'   => 'array',
        'nearby'      => 'array',
        'is_featured' => 'boolean',
        'is_verified' => 'boolean',
        'listed_at'   => 'datetime',
        'expires_at'  => 'datetime',
        'sold_at'     => 'datetime',
        'price'       => 'decimal:2',
        'area'        => 'decimal:2',
    ];
    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($p) {
            if (empty($p->slug)) {
                $p->slug = Str::slug($p->title).'-'.Str::random(5);
            }
        });
    }
    // Relationships
    public function user()        { return $this->belongsTo(User::class); }
    public function location()    { return $this->belongsTo(Location::class); }
    public function images()      { return $this->hasMany(PropertyImage::class)->orderBy('sort_order'); }
    public function primaryImage(){ return $this->hasOne(PropertyImage::class)->where('is_primary',true); }
    public function payments()    { return $this->hasMany(Payment::class); }
    public function leads()       { return $this->hasMany(Lead::class); }

    // Scopes
    public function scopeActive(Builder $q): Builder
    {
        // Include both active and sold so sold properties remain visible publicly
        return $q->whereIn('status', ['active', 'sold'])
                 ->where(function($query) {
                     $query->where('status', 'sold')
                           ->orWhere('expires_at', '>', now());
                 });
    }
    public function scopeRanked(Builder $q): Builder
    {
        return $q->orderByDesc('rank_score')->orderByDesc('created_at');
    }

    // Computed
    public function getTotalPriceAttribute(): float
    {
        return $this->price_type === 'total'
            ? (float)$this->price
            : (float)($this->price * $this->area);
    }
    public function getFormattedPriceAttribute(): string
    {
        $t = $this->total_price;
        if ($t >= 10000000) return '₹'.number_format($t/10000000,2).' Cr';
        if ($t >= 100000)   return '₹'.number_format($t/100000,0).' L';
        return '₹'.number_format($t,0,'.',',');
    }
    public function getPriceLabelAttribute(): string
    {
        return match($this->price_type) {
            'sqft'  => '/ sq.ft',
            'sqyd'  => '/ sq.yd',
            default => '',
        };
    }
    public function getWhatsappLinkAttribute(): string
    {
        $phone = preg_replace('/[^0-9]/','', $this->whatsapp_contact);
        if (!str_starts_with($phone,'91')) $phone = '91'.ltrim($phone,'0');
        $msg = urlencode("Hi, I'm interested in: {$this->title} - HyderabadZone");
        return "https://wa.me/{$phone}?text={$msg}";
    }
    public function recalculateRankScore(): void
    {
        $score = 0;
        if ($this->is_featured) $score += 300;
        if ($this->is_verified) $score += 200;
        $days  = $this->listed_at ? now()->diffInDays($this->listed_at) : 30;
        $score += max(0, 100 - ($days * 3));
        $this->update(['rank_score' => $score]);
    }
}
