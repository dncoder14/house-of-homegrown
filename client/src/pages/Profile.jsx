import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Pencil, Trash2, ChevronRight, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import { Input, Select, Field } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import { Skeleton } from '../components/ui/skeleton';
import { Price } from '../components/ui/price';
import { Badge } from '../components/ui/badge';
import { StatusBadge } from '../components/ui/status-badge';
import { PageHeader } from '../components/ui/page-header';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { ordersAPI, profileAPI, getErrorMessage } from '../utils/api';

const EMPTY_ADDRESS = {
  type: 'home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false,
};

const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(value).toLocaleDateString('en-IN', options);

const Profile = () => {
  const { user, updateUser } = useAuth();
  usePageTitle('My profile');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', phone: '', currentPassword: '', newPassword: '' });
  const [addressData, setAddressData] = useState(EMPTY_ADDRESS);

  useEffect(() => {
    Promise.all([ordersAPI.getAll(), profileAPI.getAddresses()])
      .then(([ordersRes, addressesRes]) => {
        setOrders(ordersRes.data.slice(0, 3));
        setAddresses(addressesRes.data);
      })
      .catch(() => toast.error('Failed to load your profile data'))
      .finally(() => setLoading(false));
  }, []);

  const openEditProfile = () => {
    setProfileData({ name: user?.name || '', phone: user?.phone || '', currentPassword: '', newPassword: '' });
    setShowEditProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: profileData.name, phone: profileData.phone };
      if (profileData.newPassword) {
        payload.currentPassword = profileData.currentPassword;
        payload.newPassword = profileData.newPassword;
      }
      const response = await profileAPI.update(payload);
      updateUser(response.data);
      setShowEditProfile(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update profile'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await profileAPI.addAddress(addressData);
      setAddresses(response.data);
      setShowAddAddress(false);
      setAddressData(EMPTY_ADDRESS);
      toast.success('Address saved');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add address'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async () => {
    setDeleting(true);
    try {
      const response = await profileAPI.deleteAddress(deleteTarget._id);
      setAddresses(response.data);
      setDeleteTarget(null);
      toast.success('Address removed');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete address'));
    } finally {
      setDeleting(false);
    }
  };

  const setAddr = (key) => (e) => setAddressData({ ...addressData, [key]: e.target.value });

  return (
    <div className="page-container py-8 sm:py-12">
      <PageHeader title="My profile" description="Manage your details, addresses and recent orders." />

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[20rem_1fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="account-heading">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground" aria-hidden="true">
              {(user?.name || 'U').trim().charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h2 id="account-heading" className="truncate font-sans text-lg font-semibold tracking-normal">{user?.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Phone</dt><dd className="num font-medium">{user?.phone || 'Not added'}</dd></div>
            {user?.createdAt && (
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Member since</dt><dd className="font-medium">{formatDate(user.createdAt, { month: 'long', year: 'numeric' })}</dd></div>
            )}
          </dl>
          <Button variant="outline" className="mt-6 w-full" onClick={openEditProfile}>
            <Pencil className="h-4 w-4" /> Edit profile
          </Button>
        </section>

        <div className="min-w-0 space-y-6">
          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="addr-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="addr-heading" className="font-sans text-lg font-semibold tracking-normal">Saved addresses</h2>
              <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                <Plus className="h-4 w-4" /> Add address
              </Button>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
            ) : addresses.length === 0 ? (
              <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-input px-4 py-10 text-center">
                <MapPin className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-medium">No saved addresses</p>
                <p className="mt-1 text-sm text-muted-foreground">Save one to speed up checkout.</p>
              </div>
            ) : (
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {addresses.map((address) => (
                  <li key={address._id} className="flex flex-col rounded-xl border border-border bg-surface p-4 text-sm">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-semibold capitalize">
                        <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                        {address.type}
                        {address.isDefault && <Badge variant="success">Default</Badge>}
                      </span>
                      <Button variant="ghost" size="icon-sm" className="-mr-1.5 text-muted-foreground hover:text-destructive" onClick={() => setDeleteTarget(address)} aria-label={`Delete ${address.type} address`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="font-medium">{address.fullName}</p>
                    <p className="text-muted-foreground">{address.addressLine1}{address.addressLine2 && `, ${address.addressLine2}`}</p>
                    <p className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                    <p className="num mt-1 text-muted-foreground">{address.phone}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-soft sm:p-6" aria-labelledby="orders-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="orders-heading" className="font-sans text-lg font-semibold tracking-normal">Recent orders</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/orders">View all <ChevronRight className="h-4 w-4" /></Link></Button>
            </div>

            {loading ? (
              <div className="mt-5 space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
            ) : orders.length === 0 ? (
              <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-input px-4 py-10 text-center">
                <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                <p className="mt-3 font-medium">No orders yet</p>
                <Button asChild size="sm" className="mt-4"><Link to="/shop">Start shopping</Link></Button>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {orders.map((order) => (
                  <li key={order._id}>
                    <Link to={`/order/${order._id}`} className="group -mx-2 flex items-center justify-between gap-4 rounded-lg px-2 py-3.5 transition-colors hover:bg-muted">
                      <div className="min-w-0">
                        <p className="num text-sm font-semibold">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <p className="num text-[0.8125rem] text-muted-foreground">{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <StatusBadge status={order.status} className="hidden sm:inline-flex" />
                        <Price value={order.totalAmount} className="text-sm" />
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Dialog open={showEditProfile} onOpenChange={(open) => !saving && setShowEditProfile(open)}>
        <DialogContent>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update your details. Leave the password fields empty to keep your current password.</DialogDescription>
          <form onSubmit={handleUpdateProfile} className="mt-5 space-y-4">
            <Field label="Full name" htmlFor="p-name" required>
              <Input id="p-name" autoComplete="name" required value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            </Field>
            <Field label="Phone" htmlFor="p-phone">
              <Input id="p-phone" type="tel" inputMode="tel" autoComplete="tel" value={profileData.phone} onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })} />
            </Field>
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
              <Field label="Current password" htmlFor="p-cur">
                <PasswordInput id="p-cur" autoComplete="current-password" value={profileData.currentPassword} onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })} />
              </Field>
              <Field label="New password" htmlFor="p-new">
                <PasswordInput id="p-new" autoComplete="new-password" value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setShowEditProfile(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" loading={saving}>Save changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAddress} onOpenChange={(open) => !saving && setShowAddAddress(open)}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogTitle>Add address</DialogTitle>
          <form onSubmit={handleAddAddress} className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Type" htmlFor="a-type">
              <Select id="a-type" value={addressData.type} onChange={setAddr('type')}>
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Phone" htmlFor="a-phone" required hint="10-digit mobile number">
              <Input id="a-phone" type="tel" inputMode="tel" autoComplete="tel" required value={addressData.phone} onChange={setAddr('phone')} />
            </Field>
            <Field label="Full name" htmlFor="a-name" required className="sm:col-span-2">
              <Input id="a-name" autoComplete="name" required value={addressData.fullName} onChange={setAddr('fullName')} />
            </Field>
            <Field label="Address line 1" htmlFor="a-l1" required className="sm:col-span-2">
              <Input id="a-l1" autoComplete="address-line1" required value={addressData.addressLine1} onChange={setAddr('addressLine1')} />
            </Field>
            <Field label="Address line 2" htmlFor="a-l2" className="sm:col-span-2">
              <Input id="a-l2" autoComplete="address-line2" value={addressData.addressLine2} onChange={setAddr('addressLine2')} />
            </Field>
            <Field label="City" htmlFor="a-city" required>
              <Input id="a-city" autoComplete="address-level2" required value={addressData.city} onChange={setAddr('city')} />
            </Field>
            <Field label="State" htmlFor="a-state" required>
              <Input id="a-state" autoComplete="address-level1" required value={addressData.state} onChange={setAddr('state')} />
            </Field>
            <Field label="Pincode" htmlFor="a-pin" required hint="6 digits">
              <Input id="a-pin" inputMode="numeric" autoComplete="postal-code" required pattern="\d{6}" maxLength={6} value={addressData.pincode} onChange={setAddr('pincode')} className="num" />
            </Field>
            <label className="flex items-center gap-2.5 self-center text-sm sm:mt-2">
              <input type="checkbox" checked={addressData.isDefault} onChange={(e) => setAddressData({ ...addressData, isDefault: e.target.checked })} className="h-4 w-4 rounded accent-[hsl(var(--primary))]" />
              Make this my default address
            </label>
            <div className="flex justify-end gap-2 pt-2 sm:col-span-2">
              <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)} disabled={saving}>Cancel</Button>
              <Button type="submit" loading={saving}>Save address</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this address?"
        description={deleteTarget ? `${deleteTarget.addressLine1}, ${deleteTarget.city} will be removed from your saved addresses.` : ''}
        confirmLabel="Delete address"
        cancelLabel="Keep it"
        destructive
        loading={deleting}
        onConfirm={handleDeleteAddress}
      />
    </div>
  );
};

export default Profile;
