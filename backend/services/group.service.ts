import mongoose from 'mongoose';
import { Group } from '../models/index.ts';
import ApiError from '../utils/apiError.ts';
import { buildPagination, type PaginationParams } from '../utils/pagination.util.ts';
import type { IdLike, MatchFilter, SortSpec } from '../types/common.ts';

const GROUP_SORT_OPTIONS: Record<string, SortSpec> = {
  newest: { createdAt: -1 },
  popular: { membersCount: -1, createdAt: -1 },
};

// Grup listelerinde (keşfet, gruplarım) ortak kullanılan kart görünümü.
// Üye dizisinin tamamı yerine sayı + "üye miyim" bilgisi döndürülür.
// Eski kayıtlarda bazı dizi alanları (örn. joinRequests) olmayabilir; $ifNull ile boş dizi sayılır.
const cardProjection = (viewerId: string | undefined) => ({
  name: 1,
  description: 1,
  isPrivate: 1,
  createdAt: 1,
  membersCount: 1,
  notesCount: { $ifNull: [{ $arrayElemAt: ['$notes.count', 0] }, 0] },
  isMember: viewerId ? { $in: [new mongoose.Types.ObjectId(viewerId), { $ifNull: ['$members', []] }] } : { $literal: false },
  isPending: viewerId ? { $in: [new mongoose.Types.ObjectId(viewerId), { $ifNull: ['$joinRequests', []] }] } : { $literal: false },
  owner: {
    _id: '$owner._id',
    fullName: '$owner.fullName',
    avatarUrl: '$owner.avatarUrl',
  },
});

// Filtre + sıralama + sayfalama ile grup kartlarını ve toplam sayıyı döndürür.
interface ListGroupsOptions extends PaginationParams {
  match?: MatchFilter;
  sort?: unknown;
  viewerId?: string;
}

const listGroups = async ({ match = {}, sort = 'newest', page, limit, skip, viewerId }: ListGroupsOptions) => {
  const [result] = await Group.aggregate([
    { $match: match },
    { $addFields: { membersCount: { $size: { $ifNull: ['$members', []] } } } },
    { $sort: GROUP_SORT_OPTIONS[String(sort)] || GROUP_SORT_OPTIONS.newest },
    {
      $facet: {
        items: [
          { $skip: skip },
          { $limit: limit },
          { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' } },
          { $unwind: '$owner' },
          {
            $lookup: {
              from: 'notes',
              localField: '_id',
              foreignField: 'group',
              pipeline: [{ $count: 'count' }],
              as: 'notes',
            },
          },
          { $project: cardProjection(viewerId) },
        ],
        total: [{ $count: 'count' }],
      },
    },
  ]);

  const total = result.total[0]?.count || 0;
  return { items: result.items, pagination: buildPagination(page, limit, total) };
};

// Bir gruba not paylaşabilmek için kullanıcının o grubun üyesi olması gerekir.
const assertMember = async (groupId: IdLike, userId: IdLike) => {
  const isMember = await Group.exists({ _id: groupId, members: userId });
  if (!isMember) throw new ApiError(403, 'You must be a member of the group to share notes in it.');
};

export { listGroups, assertMember, GROUP_SORT_OPTIONS };
